const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const pool = require("../config/db");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateVariant,
  deleteVariant,
} = require("../controllers/productController");

// Keep uploads in memory — files are streamed straight to Vercel Blob,
// never written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected create
router.post("/", verifyToken, upload.any(), createProduct);

// Product update/delete
router.put("/:id", verifyToken, upload.any(), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

// Variant update/delete
router.put("/variants/:id", verifyToken, upload.single("image"), updateVariant);
router.delete("/variants/:id", verifyToken, deleteVariant);

// Optional: decrease quantities (admin only — prevents arbitrary stock tampering)
router.post("/decrease-quantities", verifyToken, async (req, res) => {
  const { items } = req.body;
  try {
    for (let item of items) {
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
        }
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update quantities", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
