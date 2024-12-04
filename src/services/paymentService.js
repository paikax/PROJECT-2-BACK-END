const stripe = require("../../config/stripe"); // Load Stripe with your secret key
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

exports.createCheckoutSession = async (userId, orderId) => {
  // Fetch the order details
  const order = await Order.findById(orderId).populate("orderItems.productId");

  if (!order) {
    throw new Error("Order not found");
  }

  // Variables for coupon application
  let stripeCouponId = null;

  // Check if a coupon code is applied
  if (order.couponCode) {
    const coupon = await Coupon.findOne({
      code: order.couponCode,
      validity: { $gte: new Date() }, // Ensure the coupon is still valid
    });

    if (coupon) {
      // Create a Stripe coupon dynamically
      const stripeCoupon = await stripe.coupons.create({
        name: `Discount (${coupon.code})`,
        percent_off: coupon.discount, // Stripe accepts percentage discounts
        duration: "once", // The discount should only apply once
      });

      stripeCouponId = stripeCoupon.id; // Store the coupon ID for the session
    } else {
      throw new Error("Invalid or expired coupon code in the order.");
    }
  }

  // Prepare Stripe line items from the order
  const lineItems = order.orderItems.map((item) => {
    const unitAmount = Math.round(parseFloat(item.price) * 100); // Convert to the smallest currency unit (e.g., cents)
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
    line_items: lineItems,
    discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [], // Apply the coupon if available
    success_url: `${process.env.CLIENT_URL}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}`, // Redirect on success
    cancel_url: `${process.env.CLIENT_URL}/api/payment-failed`, // Redirect on failure
    metadata: {
      orderId: String(orderId), // Convert orderId to a string
      userId: String(userId), // Convert userId to a string, if necessary
      couponCode: order.couponCode || "None", // Include the coupon code in metadata
    },
  });

  return session.url; // Return Stripe Checkout session URL
};