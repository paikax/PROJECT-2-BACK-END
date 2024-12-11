const stripe = require("../../config/stripe"); // Load Stripe with your secret key
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const cartService = require("./cartService");

exports.createCheckoutSession = async (
  userId,
  orderId,
  { totalPrice, deliveryAddress, appliedCoupon, discount, paymentMethod }
) => {
  const cart = await cartService.getCart(userId);
  if (!cart) {
    throw new Error("cart not found");
  }

  // Variables for coupon application
  let stripeCouponId = null;

  // Check if a coupon code is applied
  if (cart.appliedCoupon) {
    const coupon = await Coupon.findOne({
      code: cart.appliedCoupon,
      startDate: { $gte: new Date() },
      endDate: { $gte: new Date() }, // Ensure the coupon is still valid
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
    discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [], // Use couponCode directly here
    success_url: `${process.env.CLIENT_URL}/payment/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/stripe-failed`,
    metadata: {
      userId,
      deliveryAddress,
      appliedCoupon: appliedCoupon || "None",
      discount,
      totalPrice,
      paymentMethod,
    },
  });

  return session.url;
};
