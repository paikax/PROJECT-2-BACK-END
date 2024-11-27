const stripe = require("../../config/stripe");
const paymentService = require("../services/paymentService");

// Create a checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body; // Extract order ID from the request body
    const userId = req.user.id; // Logged-in user ID

    // Call service to create a Stripe checkout session
    const sessionUrl = await paymentService.createCheckoutSession(
      userId,
      orderId
    );

    res.status(200).json({ url: sessionUrl }); // Return the session URL
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Handle Stripe webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]; // Extract Stripe signature
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Raw body parsed by express.raw
      sig,
      // process.env.STRIPE_WEBHOOK_SECRET
      "whsec_e941b3c6db04d75e08c90e7c609b1fa5110d765f90a7b6ebe9af0954f9976dad"
    );

    console.log("Webhook verified:", event.type);

    // Delegate webhook handling to the service
    await paymentService.handleWebhook(event);
    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
