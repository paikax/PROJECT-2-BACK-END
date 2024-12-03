const stripe = require("../../config/stripe"); // Load Stripe with your secret key
const Order = require("../models/Order");

// paymentService.js
exports.createCheckoutSession = async (userId, orderId) => {
  // Fetch the order details
  const order = await Order.findById(orderId).populate("orderItems.productId");

  if (!order) {
    throw new Error("Order not found");
  }

  // Prepare Stripe line items from the order
  const lineItems = order.orderItems.map((item) => {
    // Ensure the price is treated as a number
    const unitAmount = Math.round(parseFloat(item.price) * 100); // Convert to the smallest currency unit (e.g., VND cents)
    return {
      price_data: {
        currency: "vnd", // Currency in VND
        product_data: {
          name: item.productId.name,
          images: [item.productId.imageUrls?.[0] || "default-image-url"], // Fallback for image URL
        },
        unit_amount: unitAmount, // Amount in VND
      },
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1), // Default quantity to 1 if invalid
    };
  });

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    // customer_email: order.user.email,
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}`, // Redirect on success
    cancel_url: `${process.env.CLIENT_URL}/api/payment-failed`, // Redirect on failure
    metadata: {
      orderId: String(orderId), // Convert orderId to a string
      userId: String(userId), // Convert userId to a string, if necessary
    },
  });

  return session.url; // Return Stripe Checkout session URL
};