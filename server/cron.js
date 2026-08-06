const cron = require("node-cron");
const pool = require("./config/db");

cron.schedule("0 0 * * *", async () => {
  try {
    const result = await pool.query(`
      DELETE FROM products
      WHERE quantity = 0 AND out_of_stock_at IS NOT NULL
      AND out_of_stock_at < NOW() - INTERVAL '20 days'
    `);
    console.log(
      `[CRON] Deleted ${result.rowCount} old out-of-stock products`
    );
  } catch (err) {
    console.error("[CRON ERROR]", err);
  }
});