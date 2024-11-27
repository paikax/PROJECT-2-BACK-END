const stripe = require("../../config/stripe"); // Load Stripe with your secret key
const Order = require("../models/Order");

exports.createCheckoutSession = async (userId, orderId) => {
  // Fetch the order details from the database
  const order = await Order.findOne({ _id: orderId }).populate(
    "orderItems.productId"
  );

  if (!order) {
    throw new Error("Order not found");
  }

  // Prepare Stripe line items from the order
  const lineItems = order.orderItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.productId.name, // Product name
        images: [item.productId.imageUrls[0]], // Use the first image (optional)
        metadata: {
          variantId: item.variantId.toString() || "N/A",
        },
      },
      unit_amount: Math.round(item.price * 100), // Convert price to cents
    },
    quantity: item.quantity,
  }));

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // Allow card payments
    mode: "payment",
    // customer_email: order.user.email, // Use the user's email associated with the order
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`, // Redirect on success
    cancel_url: `${process.env.CLIENT_URL}/payment-failed`, // Redirect on failure
    metadata: {
      orderId: orderId,
      userId: userId,
    },
  });

  return session.url; // Return the Stripe Checkout session URL
};

// Handle Stripe Webhook
exports.handleWebhook = async (event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      // Update the order status to "Paid" in the database
      const orderId = session.metadata.orderId;
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Paid",
        status: "Processing", // Optionally update the order status as well
      });

      console.log(`Order ${orderId} has been marked as Paid.`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};
