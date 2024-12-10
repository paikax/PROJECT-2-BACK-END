const stripe = require("../../config/stripe");
const paymentService = require("../services/paymentService");
const cartService = require("../services/cartService");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

// Create a checkout session for Pay Now
exports.createCheckoutSession = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    const userId = req.user.id;

    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot place an order." });
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      const variantPrice = item.variantDetails
        ? parseFloat(item.variantDetails.price || 0)
        : parseFloat(item.product.price || 0);
      return sum + item.count * variantPrice;
    }, 0);

    let discount = 0;
    let couponCode = null;

    // Check if a coupon is applied from the cart
    if (cart.appliedCoupon) {
      couponCode = cart.appliedCoupon; // Get the coupon code from the cart
      const coupon = await Coupon.findOne({
        code: couponCode,
        validity: { $gte: new Date() },
      });

      if (coupon) {
        if (totalPrice >= coupon.minCartPrice) {
          discount = coupon.discount; // Apply the coupon discount
        } else {
          return res.status(400).json({
            error: `Coupon requires a minimum cart price of ${coupon.minCartPrice}. Your cart total is ${totalPrice}.`,
          });
        }
      } else {
        return res
          .status(400)
          .json({ error: "Invalid or expired coupon code." });
      }
    }

    const finalPrice = (totalPrice * discount) / 100; // Calculate discount as a percentage;

    // Create a Stripe Checkout session
    const sessionUrl = await paymentService.createCheckoutSession(
      userId,
      null, // Pass null as `orderId` because the order is not created yet
      {
        totalPrice: finalPrice,
        deliveryAddress,
        couponCode,
        discount,
      }
    );

    res.status(200).json({ url: sessionUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Payment Success Handler
exports.paymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const userId = session.metadata.userId;
    const cart = await cartService.getCart(userId);

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot create an order." });
    }

    // Fetch metadata from the payment session
    const totalPrice = parseFloat(session.amount_total / 100); // Stripe total is in smallest currency unit
    const deliveryAddress = session.metadata.deliveryAddress;
    const couponCode = session.metadata.couponCode;
    const discount = parseFloat(session.metadata.discount || 0);

    // Create the order
    const order = new Order({
      userId: userId,
      status: "Pending", // Initial status
      paymentStatus: "Paid", // Mark as paid since payment was successful
      totalQuantity: cart.items.reduce((sum, item) => sum + item.count, 0),
      totalPrice: totalPrice,
      deliveryAddress: deliveryAddress,
      couponCode: couponCode || null,
      discountAmount: discount,
      orderItems: cart.items.map((item) => ({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: item.count,
        price: item.variantDetails
          ? parseFloat(item.variantDetails.price || 0)
          : parseFloat(item.product.price || 0),
      })),
    });

    await order.save();

    // Clear the cart after a successful order
    await cartService.clearCart(userId);

    res
      .status(200)
      .json({ message: "Payment successful and order created.", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pay for an order after delivery
exports.payForOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to pay for this order." });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ error: "Order is already paid." });
    }

    const sessionUrl = await paymentService.createCheckoutSession(
      userId,
      orderId
    );

    res.status(200).json({ url: sessionUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
