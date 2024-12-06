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
      return res.status(400).json({ error: "Cart is empty. Cannot place an order." });
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
      const coupon = await Coupon.findOne({ code: couponCode, validity: { $gte: new Date() } });

      if (coupon) {
        if (totalPrice >= coupon.minCartPrice) {
          discount = coupon.discount; // Apply the coupon discount
        } else {
          return res.status(400).json({
            error: `Coupon requires a minimum cart price of ${coupon.minCartPrice}. Your cart total is ${totalPrice}.`,
          });
        }
      } else {
        return res.status(400).json({ error: "Invalid or expired coupon code." });
      }
    }

    const finalPrice = totalPrice - discount;

    // Create the order
    const order = new Order({
      userId: userId,
      status: "Pending", // Set initial status to Pending
      paymentStatus: "Unpaid", // Initially unpaid
      totalQuantity: cart.items.reduce((sum, item) => sum + item.count, 0),
      totalPrice: finalPrice,
      deliveryAddress: deliveryAddress,
      couponCode: couponCode || null, // Set couponCode
      discountAmount: discount, // Include discountAmount
      orderItems: cart.items.map((item) => ({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: item.count,
        price: item.variantDetails ? parseFloat(item.variantDetails.price || 0) : parseFloat(item.product.price || 0),
      })),
    });

    await order.save();

    const sessionUrl = await paymentService.createCheckoutSession(userId, order._id);

    res.status(200).json({ url: sessionUrl, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Payment Success Handler
exports.paymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Get the orderId from the session metadata
    const orderId = session.metadata.orderId;

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "Paid",
      status: "Delivered", // Change status to Delivered
    });

    // Clear the cart for the user
    await cartService.clearCart(req.user.id);

    res.status(200).json({ message: "Payment successful. Order delivered." });
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
      return res.status(403).json({ error: "You are not authorized to pay for this order." });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ error: "Order is already paid." });
    }

    const sessionUrl = await paymentService.createCheckoutSession(userId, orderId);

    res.status(200).json({ url: sessionUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};