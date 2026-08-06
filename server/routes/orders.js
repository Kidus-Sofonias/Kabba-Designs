const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getOrdersByTxRef,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController");

// All order data requires an admin token — orders contain customer PII.
router.get("/by-tx-ref/:tx_ref", verifyToken, getOrdersByTxRef);
router.get("/:id", verifyToken, getOrderById);
router.get("/", verifyToken, getAllOrders);

module.exports = router;
