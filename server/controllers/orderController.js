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

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByTxRef,
};
