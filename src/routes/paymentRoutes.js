const express = require("express");
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session for payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []  # Requires a valid JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order to be paid for
 *                 example: "648fcf3e4a70b6e7e5a4f123"
 *     responses:
 *       200:
 *         description: URL to the Stripe Checkout session
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/payment/create-checkout-session",
  verifyToken,
  paymentController.createCheckoutSession
);

// router.post(
//   "/api/webhook",
//   express.raw({ type: "application/json" }), // Use raw body for Stripe webhook
//   paymentController.stripeWebhook // The controller handling webhook logic
// );

module.exports = router;
