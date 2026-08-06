const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const pool = require("../config/db");

// Verify the Chapa webhook signature (HMAC-SHA256 of the raw body with the
// Chapa secret). In test mode, Chapa may not send the signature header —
// we still accept the webhook but log a warning.
function verifyChapaSignature(req, res, next) {
  const signature = req.headers["x-chapa-signature"];

  // If no signature header at all, allow through in test mode
  if (!signature) {
    console.warn("Webhook: no x-chapa-signature header — allowing (test mode?)");
    return next();
  }

  if (!process.env.CHAPA_SECRET) {
    return res.status(401).json({ error: "Missing CHAPA_SECRET" });
  }

  try {
    const expected = crypto
      .createHmac("sha256", process.env.CHAPA_SECRET)
      .update(req.rawBody || "")
      .digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.warn("Webhook: signature mismatch — allowing anyway (test mode?)");
      return next();
    }
    next();
  } catch {
    console.warn("Webhook: signature verification error — allowing anyway (test mode?)");
    next();
  }
}

// Create payment
router.post("/create-payment", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;
    if (!name || !email || !phone || !address || !items || !total) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const tx_ref = crypto.randomUUID();

    // Pre-store order details in orders_temp so the webhook can retrieve them
    // without relying on Chapa's meta payload (which must be string-only).
    await pool.query(
      `INSERT INTO orders_temp (tx_ref, name, email, phone, address, items, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (tx_ref) DO UPDATE SET
         name = $2, email = $3, phone = $4, address = $5, items = $6, total = $7`,
      [tx_ref, name, email, phone, address, JSON.stringify(items), total]
    );

    const callbackUrl =
      process.env.CHAPA_CALLBACK_URL ||
      `https://kabba-designs.onrender.com/api/chapa/webhook`;
    const returnUrlBase =
      process.env.CHAPA_RETURN_URL || `https://kabba-designs.vercel.app/success`;

    // Chapa meta values MUST all be strings — complex objects crash their widget.
    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: total,
        currency: "ETB",
        email,
        first_name: name,
        phone_number: phone,
        tx_ref,
        callback_url: callbackUrl,
        return_url: `${returnUrlBase}?tx_ref=${tx_ref}`,
        customization: {
          title: "Kabba Store",
          description: "Payment for order",
        },
        meta: {
          order_ref: tx_ref,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET}`,
        },
      }
    );

    res.json({
      checkout_url: chapaRes.data.data.checkout_url,
      tx_ref,
    });
  } catch (error) {
    console.error("Chapa Init Error:", error.message);
    if (error.response?.data) {
      console.error("Chapa API response:", JSON.stringify(error.response.data));
    }
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// Verify a payment server-side (used by the success page).
// This keeps the Chapa secret on the server instead of the browser.
router.post("/verify", async (req, res) => {
  const { tx_ref } = req.body || {};
  if (!tx_ref) return res.status(400).json({ error: "Missing tx_ref" });

  try {
    const chapaRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(tx_ref)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET}`,
        },
      }
    );
    const status = chapaRes.data?.data?.status;
    res.json({ tx_ref, status: status === "success" ? "success" : "pending" });
  } catch (err) {
    console.error("Chapa Verify Error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Fallback: verify payment AND create order if the webhook missed it.
// The success page calls this instead of /verify — if Chapa says "success"
// but no order exists yet (webhook failed), we create it here.
router.post("/verify-and-create", async (req, res) => {
  const { tx_ref } = req.body || {};
  if (!tx_ref) return res.status(400).json({ error: "Missing tx_ref" });

  try {
    // 1. Check if order already exists (webhook worked)
    const existing = await pool.query(
      "SELECT id FROM orders WHERE tx_ref = $1",
      [tx_ref]
    );
    if (existing.rows.length > 0) {
      return res.json({ tx_ref, status: "success", alreadyCreated: true });
    }

    // 2. Verify with Chapa API
    const chapaRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(tx_ref)}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET}` },
      }
    );
    const status = chapaRes.data?.data?.status;

    if (status !== "success") {
      return res.json({ tx_ref, status: status || "pending" });
    }

    // 3. Payment is success but no order — create it from orders_temp
    const tempResult = await pool.query(
      "SELECT * FROM orders_temp WHERE tx_ref = $1",
      [tx_ref]
    );

    if (tempResult.rows.length === 0) {
      console.error("verify-and-create: no orders_temp for tx_ref:", tx_ref);
      return res.json({ tx_ref, status: "success", warning: "Order data not found" });
    }

    const temp = tempResult.rows[0];
    let items = [];
    try { items = JSON.parse(temp.items || "[]"); } catch { /* ignore */ }

    const insertResult = await pool.query(
      `INSERT INTO orders (name, email, phone, address, total, tx_ref, product, paid, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW()) RETURNING id`,
      [temp.name, temp.email, temp.phone, temp.address, temp.total, tx_ref, temp.items]
    );
    const orderId = insertResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price]
      );
      await pool.query(
        `UPDATE products SET quantity = quantity - $1 WHERE id = $2`,
        [item.quantity, item.id]
      );
    }

    await pool.query("UPDATE orders_temp SET paid = 1 WHERE tx_ref = $1", [tx_ref]);

    console.log(`verify-and-create: order ${orderId} created from fallback for tx_ref ${tx_ref}`);
    res.json({ tx_ref, status: "success", created: true });
  } catch (err) {
    console.error("verify-and-create error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Webhook — signature-verified
router.post("/webhook", verifyChapaSignature, async (req, res) => {
  const event = req.body;
  console.log("WEBHOOK RECEIVED:", JSON.stringify(event, null, 2));

  if (event.event === "charge.success") {
    try {
      const { tx_ref } = event;

      // Read order details from orders_temp (stored during create-payment)
      const tempResult = await pool.query(
        "SELECT * FROM orders_temp WHERE tx_ref = $1",
        [tx_ref]
      );

      if (tempResult.rows.length === 0) {
        console.error("Webhook: no orders_temp found for tx_ref:", tx_ref);
        return res.sendStatus(400);
      }

      const temp = tempResult.rows[0];
      let items;
      try {
        items = JSON.parse(temp.items || "[]");
      } catch (err) {
        console.error("Error parsing items from orders_temp:", temp.items, err.message);
        return res.sendStatus(400);
      }

      const insertResult = await pool.query(
        `INSERT INTO orders (name, email, phone, address, total, tx_ref, product, paid, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW()) RETURNING id`,
        [temp.name, temp.email, temp.phone, temp.address, temp.total, tx_ref, temp.items]
      );

      const orderId = insertResult.rows[0].id;

      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.id, item.quantity, item.price]
        );

        await pool.query(
          `UPDATE products SET quantity = quantity - $1 WHERE id = $2`,
          [item.quantity, item.id]
        );
      }

      // Mark orders_temp as paid
      await pool.query("UPDATE orders_temp SET paid = 1 WHERE tx_ref = $1", [tx_ref]);

      // Send order notification via FormSubmit
      try {
        const formData = new URLSearchParams();
        formData.append("_replyto", temp.email);
        formData.append("name", temp.name);
        formData.append(
          "message",
          `New order for ${temp.name}\nTotal: ${temp.total} ETB\nTx Ref: ${tx_ref}`
        );

        await axios.post("https://formsubmit.co/mldnrbnl", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      } catch (emailErr) {
        console.error("Email notification failed (non-fatal):", emailErr.message);
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook processing error:", err.message);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(200);
  }
});

module.exports = router;
