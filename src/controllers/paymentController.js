const stripe = require("../../config/stripe");
const paymentService = require("../services/paymentService");
const cartService = require("../services/cartService");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

// Create a checkout session
// Create a checkout session with coupon option
exports.createCheckoutSession = async (req, res) => {
  try {
    const { deliveryAddress, couponCode } = req.body; // Accept couponCode from user input
    const userId = req.user.id;

    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty. Cannot place an order." });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => {
      const variantPrice = item.variantDetails
        ? parseFloat(item.variantDetails.price)
        : parseFloat(item.product.price);
      return sum + item.count * variantPrice;
    }, 0);

    // Check for coupon and apply discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, validity: { $gte: new Date() } });
      if (coupon) {
        discount = coupon.discount; // Apply the coupon discount
      } else {
        return res.status(400).json({ error: "Invalid or expired coupon code." });
      }
    }

    const finalPrice = totalPrice - discount; // Calculate final price after discount

    const order = new Order({
      userId: userId,
      status: "Pending",
      paymentStatus: "Unpaid",
      totalQuantity: cart.items.reduce((sum, item) => sum + item.count, 0),
      totalPrice: finalPrice, // Save the discounted price
      deliveryAddress: deliveryAddress,
      couponCode: couponCode || null, // Save the coupon code if provided
      orderItems: cart.items.map((item) => ({
        productId: item.product,
        variantId: item.variantId,
        quantity: item.count,
        price: item.variantDetails
          ? parseFloat(item.variantDetails.price)
          : parseFloat(item.product.price),
      })),
    });

    await order.save();

    const sessionUrl = await paymentService.createCheckoutSession(userId, order._id);
    res.status(200).json({ url: sessionUrl, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// paymentController.js (handling successful payment return)
exports.paymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query; // Extract session_id from the URL

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Get the orderId from the session metadata
    const orderId = session.metadata.orderId;

    // Update the order status to 'Paid'
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "Paid",
      status: "Processing", // You can update the status to Processing or any other appropriate status
    });

    // Clear the cart for the user
    await cartService.clearCart(req.user.id);

    // Send confirmation response
    res.status(200).json({ message: "Payment successful. Order created." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
