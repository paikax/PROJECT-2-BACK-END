const express = require("express");
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment related operations
 */

/**
 * @swagger
 * /payment/stripe-checkout:
 *   post:
 *     summary: Creates a Stripe checkout session based on the user's cart
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []  # Authorization via Bearer token (JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *                 description: The delivery address for the order
 *                 example: "1234 Main St, City, Country"
 *     responses:
 *       200:
 *         description: A URL to the Stripe Checkout session to complete payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the Stripe Checkout session
 *                   example: "https://checkout.stripe.com/pay/cs_test_12345"
 *       400:
 *         description: Bad request (empty cart or missing delivery address)
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/payment/stripe-checkout",
  verifyToken,
  paymentController.createCheckoutSession
);

/**
 * @swagger
 * /stripe-success/session_id:
 *   get:
 *     summary: Handles the payment success after the user completes the payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []  # Authorization via Bearer token (JWT)
 *     responses:
 *       200:
 *         description: Success page after a successful payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message after successful payment
 *                   example: "Payment was successful. Order created."
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.get("/stripe-success", verifyToken, paymentController.paymentSuccess);

module.exports = router;
