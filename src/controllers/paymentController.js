const stripe = require("../../config/stripe");
const paymentService = require("../services/paymentService");
const cartService = require("../services/cartService");
const Order = require("../models/Order");

// Create a checkout session
// paymentController.js
exports.createCheckoutSession = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    const userId = req.user.id; // Logged-in user ID

    // Get the cart for the user
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot place an order." });
    }

    // Calculate the total price from the cart
    const totalPrice = cart.items.reduce((sum, item) => {
      const variantPrice = item.variantDetails
        ? parseFloat(item.variantDetails.price) // Ensure this is a Number
        : parseFloat(item.product.price); // Ensure this is a Number
      return sum + item.count * variantPrice;
    }, 0);

    // Create the order in the database first (status: 'Pending')
    const order = new Order({
      userId: userId,
      status: "Pending", // Order status is initially 'Pending'
      paymentStatus: "Unpaid",
      totalQuantity: cart.items.reduce((sum, item) => sum + item.count, 0),
      totalPrice: totalPrice,
      deliveryAddress: deliveryAddress,
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

    // Now create a Stripe checkout session
    const sessionUrl = await paymentService.createCheckoutSession(
      userId,
      order._id
    );

    res.status(200).json({ url: sessionUrl }); // Return Stripe checkout session URL for the client
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
