const stripe = require("../../config/stripe");
const paymentService = require("../services/paymentService");
const cartService = require("../services/cartService");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");

// Create a checkout session for Pay Now
exports.createCheckoutSession = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body; // Include paymentMethod
    const userId = req.user.id;

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required." });
    }

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
        startDate: { $gte: new Date() },
        endDate: { $gte: new Date() },
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
        paymentMethod,
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
    const totalPrice = parseFloat(session.amount_total); // Stripe total is in smallest currency unit
    const deliveryAddress = session.metadata.deliveryAddress;
    const couponCode = session.metadata.couponCode;
    const discount = parseFloat(session.metadata.discount || 0);
    const paymentMethod = session.metadata.paymentMethod;

    // Verify stock availability before creating the order
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        throw new Error(`Product with ID ${item.product._id} not found.`);
      }

      if (item.variantId) {
        // Check stock for the variant
        const variant = product.variants.id(item.variantId);

        if (!variant) {
          throw new Error(`Variant with ID ${item.variantId} not found.`);
        }

        if (variant.stockQuantity < item.count) {
          throw new Error(
            `Insufficient stock for variant '${
              variant.attributes.get("name") || "unknown"
            }'. Only ${variant.stockQuantity} left in stock.`
          );
        }
      } else {
        // Check stock for the main product
        if (product.stockQuantity < item.count) {
          throw new Error(
            `Insufficient stock for product '${product.name}'. Only ${product.stockQuantity} left in stock.`
          );
        }
      }
    }

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
      paymentMethod: paymentMethod, // Include payment method
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

    // Decrease stock quantity for each ordered item
    for (const item of cart.items) {
      if (item.variantId) {
        // Update stock for a variant
        await Product.updateOne(
          { _id: item.product._id, "variants._id": item.variantId },
          { $inc: { "variants.$.stockQuantity": -item.count } }
        );
      } else {
        // Update stock for the product (no variants)
        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { stockQuantity: -item.count } }
        );
      }
    }

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
