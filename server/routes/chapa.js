const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const pool = require("../config/db");

// Verify the Chapa webhook signature (HMAC-SHA256 of the raw body with the
// Chapa secret). Rejects requests that do not carry a valid signature.
function verifyChapaSignature(req, res, next) {
  const signature = req.headers["x-chapa-signature"];
  if (!signature || !process.env.CHAPA_SECRET) {
    return res.status(401).json({ error: "Missing signature" });
  }

  try {
    const expected = crypto
      .createHmac("sha256", process.env.CHAPA_SECRET)
      .update(req.rawBody || "")
      .digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "Invalid signature" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid signature" });
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

    const callbackUrl =
      process.env.CHAPA_CALLBACK_URL ||
      `https://kabba-designs-server.onrender.com/api/chapa/webhook`;
    const returnUrlBase =
      process.env.CHAPA_RETURN_URL || `https://kabbadesign.com.et/success`;

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
          name,
          email,
          phone,
          address,
          items: JSON.stringify(items),
          total,
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

// Webhook — signature-verified
router.post("/webhook", verifyChapaSignature, async (req, res) => {
  const event = req.body;
  console.log("WEBHOOK RECEIVED:", JSON.stringify(event, null, 2));

  if (event.event === "charge.success") {
    try {
      const {
        tx_ref,
        email,
        first_name: name,
        phone: phone_number,
        customization,
        meta,
      } = event;

      if (!meta || !meta.items) {
        console.error("Missing meta.items or meta fields");
        return res.sendStatus(400);
      }

      let items;
      try {
        items = JSON.parse(meta.items);
      } catch (err) {
        console.error("Error parsing items:", meta.items, err.message);
        return res.sendStatus(400);
      }

      const insertResult = await pool.query(
        `INSERT INTO orders (name, email, phone, address, total, tx_ref, product, paid, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW()) RETURNING id`,
        [meta.name, meta.email, meta.phone, meta.address, meta.total, tx_ref, meta.items]
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

      // Send order notification via FormSubmit
      const formData = new URLSearchParams();
      formData.append("_replyto", meta.email);
      formData.append("name", meta.name);
      formData.append(
        "message",
        `New order for ${meta.name}\nTotal: ${meta.total} ETB\nTx Ref: ${tx_ref}`
      );

      await axios.post("https://formsubmit.co/mldnrbnl", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

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
