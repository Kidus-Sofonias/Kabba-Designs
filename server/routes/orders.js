const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const {
  getOrdersByTxRef,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
} = require("../controllers/orderController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Public: track order by tx_ref or email (no auth required)
router.get("/track", trackOrder);

// Admin-only routes
router.get("/by-tx-ref/:tx_ref", verifyToken, getOrdersByTxRef);
router.get("/:id", verifyToken, getOrderById);
router.get("/", verifyToken, getAllOrders);
router.put("/:id/status", verifyToken, upload.single("delivery_proof"), updateOrderStatus);

module.exports = router;
