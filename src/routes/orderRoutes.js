const express = require("express");
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get("/orders", verifyToken, orderController.getUserOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details
 */
router.get("/orders/:orderId", verifyToken, orderController.getOrderDetails);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place an order from the user's cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *                 description: Delivery address for the order
 *                 example: "123 Main St, Springfield"
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post("/orders", verifyToken, cartController.placeOrder);

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to delete
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order not found
 */
router.delete("/orders/:orderId", verifyToken, orderController.deleteOrder);

module.exports = router;