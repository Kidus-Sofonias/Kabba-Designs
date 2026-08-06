const pool = require("../config/db");

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    const orders = result.rows;

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT oi.*, p.name, p.image_urls
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    console.error("[getAllOrders ERROR]", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = result.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image_urls
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    console.error("[getOrderById ERROR]", err.message);
    res.status(500).json({ error: "Error fetching order" });
  }
};

const getOrdersByTxRef = async (req, res) => {
  const tx_ref = req.params.tx_ref;
  try {
    const result = await pool.query("SELECT * FROM orders WHERE tx_ref = $1", [tx_ref]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = result.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image_urls
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    res.json({ ...order, items: itemsResult.rows });
  } catch (err) {
    console.error("[getOrdersByTxRef ERROR]", err.message);
    res.status(500).json({ error: "Error fetching order" });
  }
};

const VALID_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error("[updateOrderStatus ERROR]", err.message);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

const trackOrder = async (req, res) => {
  const { tx_ref, email } = req.query;

  if (!tx_ref && !email) {
    return res.status(400).json({ error: "Provide tx_ref or email" });
  }

  try {
    let result;
    if (tx_ref) {
      result = await pool.query("SELECT id, name, email, status, total, tx_ref, created_at FROM orders WHERE tx_ref = $1", [tx_ref]);
    } else {
      result = await pool.query("SELECT id, name, email, status, total, tx_ref, created_at FROM orders WHERE email = $1 ORDER BY id DESC", [email]);
    }

    if (!result.rows.length) {
      return res.status(404).json({ error: "No orders found" });
    }

    // Enrich each order with items
    const orders = await Promise.all(
      result.rows.map(async (order) => {
        const items = await pool.query(
          `SELECT oi.quantity, oi.price, p.name, p.image_urls
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    res.json(orders);
  } catch (err) {
    console.error("[trackOrder ERROR]", err.message);
    res.status(500).json({ error: "Failed to track order" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByTxRef,
  updateOrderStatus,
  trackOrder,
};
