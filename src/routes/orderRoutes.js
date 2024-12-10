const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const router = express.Router();

// Schedule the function to update order statuses every 2 minutes
const updateOrderStatuses = orderController.updateOrderStatuses;
setInterval(updateOrderStatuses, 1 * 60 * 1000);

// Route to create an order for Pay Later
router.post("/pay-later", verifyToken, orderController.createOrderForPayLater);

// Pay for an order after delivery
router.post("/order/pay-later", verifyToken, orderController.payForOrder);

// Cancel an order
router.post("/order/cancel", verifyToken, orderController.cancelOrder);

// Get all orders (admin only)
router.get("/orders", verifyToken, orderController.getAllOrders);

// Get all orders for the authenticated user
router.get("/orders/user", verifyToken, orderController.getUserOrders);

// Get all orders for the authenticated seller's products
router.get("/orders/seller", verifyToken, orderController.getSellerOrders);

module.exports = router;