const express = require("express");
const pool = require("./config/db");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/api/checkout", async (req, res) => {
  const { location, phone, email, payment, cart, paid, tx_ref } = req.body;
  if (
    !location ||
    !phone ||
    !email ||
    !payment ||
    !cart ||
    !cart.length ||
    !tx_ref
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderResult = await pool.query(
      `INSERT INTO orders (email, phone, location, payment, paid, total, created_at, product, tx_ref)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8) RETURNING id`,
      [email, phone, location, payment, paid ? 1 : 0, total, JSON.stringify(cart), tx_ref]
    );

    const orderId = orderResult.rows[0].id;

    for (let item of cart) {
      await pool.query(
        "INSERT INTO order_items (product_id, quantity, price, order_id, variant) VALUES ($1, $2, $3, $4, $5)",
        [item.id, item.quantity, item.price, orderId, item.variant || null]
      );

      // Variant decrement logic
      if (item.variant) {
        await pool.query(
          "UPDATE product_variants SET quantity = GREATEST(quantity - $1, 0) WHERE product_id = $2 AND name = $3",
          [item.quantity, item.id, item.variant]
        );
      } else {
        const current = await pool.query(
          "SELECT quantity FROM products WHERE id = $1",
          [item.id]
        );

        if (current.rows.length > 0) {
          const newQty = Math.max(0, current.rows[0].quantity - item.quantity);

          await pool.query(
            "UPDATE products SET quantity = $1, out_of_stock_at = $2 WHERE id = $3",
            [newQty, newQty === 0 ? new Date() : null, item.id]
          );

          console.log(
            `DECREMENTING: product ${item.id}, ordered ${item.quantity}, new quantity: ${newQty}`
          );
        }
      }
    }

    await pool.query("UPDATE orders_temp SET paid = 1 WHERE tx_ref = $1", [tx_ref]);

    // Send email notification
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NOTIFY_EMAIL,
          pass: process.env.NOTIFY_EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL,
        to: process.env.NOTIFY_EMAIL,
        subject: "New Order Received",
        text: `New order received from ${email} for ${cart.length} items.`,
      });
    } catch (emailErr) {
      console.error("Email sending failed (non-fatal):", emailErr.message);
    }

    res.json({ success: true, message: "Order placed and stock updated" });
  } catch (err) {
    console.error("[checkout error]", err);
    res.status(500).json({ error: "Order processing failed" });
  }
});

module.exports = router;