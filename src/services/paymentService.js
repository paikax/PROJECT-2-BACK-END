const stripe = require("../../config/stripe"); // Load Stripe with your secret key
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const cartService = require("./cartService");

exports.createCheckoutSession = async (
  userId,
  orderId,
  { totalPrice, deliveryAddress, couponCode, discount }
) => {
  const cart = await cartService.getCart(userId);

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty. Cannot create a checkout session.");
  }

  const lineItems = cart.items.map((item) => {
    const unitAmount = Math.round(
      parseFloat(item.variantDetails?.price || item.product.price) 
    ); // Convert to smallest currency unit

    return {
      price_data: {
        currency: "vnd",
        product_data: {
          name: item.product.name,
          images: [item.product.imageUrls?.[0] || "default-image-url"],
        },
        unit_amount: unitAmount,
      },
      quantity: item.count,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    discounts: discount ? [{ coupon: discount }] : [], // Apply discount if available
    success_url: `${process.env.CLIENT_URL}/payment/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/stripe-failed`,
    metadata: {
      userId,
      deliveryAddress,
      couponCode: couponCode || "None",
      discount,
      totalPrice,
    },
  });

  return session.url;
};
