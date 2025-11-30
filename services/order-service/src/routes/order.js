const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const cartController = require("../controllers/cartController");
const { authenticate, authorize } = require("../../shared/middleware/auth");

// Order routes
router.post("/orders", authenticate, orderController.createOrder);
router.get("/orders", authenticate, orderController.getOrders);
router.get("/orders/:id", authenticate, orderController.getOrderById);
router.put(
  "/orders/:id/status",
  authenticate,
  authorize("boutique_owner", "admin"),
  orderController.updateOrderStatus
);
router.post("/orders/:id/cancel", authenticate, orderController.cancelOrder);

// Cart routes
router.post("/cart/add", authenticate, cartController.addToCart);
router.get("/cart", authenticate, cartController.getCart);
router.delete("/cart/:itemId", authenticate, cartController.removeFromCart);
router.delete("/cart", authenticate, cartController.clearCart);

module.exports = router;

