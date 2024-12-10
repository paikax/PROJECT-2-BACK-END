const Order = require("../models/Order");
const cartService = require("../services/cartService");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");

exports.createOrderForPayLater = async (req, res) => {
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
        price: item.variantDetails
          ? parseFloat(item.variantDetails.price || 0)
          : parseFloat(item.product.price || 0),
      })),
    });

    await order.save();

    res
      .status(201)
      .json({ message: "Order created successfully.", orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order statuses (automated)
exports.updateOrderStatuses = async () => {
  try {
    const orders = await Order.find({
      status: { $in: ["Pending", "Processing", "Shipping"] },
    });

    for (const order of orders) {
      let nextStatus;

      switch (order.status) {
        case "Pending":
          nextStatus = "Processing";
          break;
        case "Processing":
          nextStatus = "Shipping";
          break;
        case "Shipping":
          nextStatus = "Delivered"; // Move to Delivered
          break;
        default:
          nextStatus = order.status;
      }

      if (nextStatus) {
        order.status = nextStatus;
        await order.save();
        console.log(`Order ${order._id} status updated to '${nextStatus}'.`);
      }
    }
  } catch (err) {
    console.error("Error updating order statuses:", err.message);
  }
};

// Pay for an order after delivery
exports.payForOrder = async (req, res) => {
  try {
    const { orderId } = req.body; // Order ID passed in the request body
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

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body; // Order ID passed in the request body
    const userId = req.user.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to cancel this order." });
    }

    if (order.status !== "Processing") {
      return res
        .status(400)
        .json({
          error:
            "Order can only be canceled when it is in the 'Processing' status.",
        });
    }

    // Update order status and payment status
    order.status = "Cancelled";
    order.paymentStatus = "Refunded";
    await order.save();

    res.status(200).json({ message: "Order canceled successfully.", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const orders = await Order.find()
      .populate("orderItems.productId")
      .populate("userId");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders for the authenticated user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).populate(
      "orderItems.productId"
    );
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders for the authenticated seller's products
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id; // Assuming the seller is authenticated and their ID is available in req.user

    // Find all products owned by the seller
    const sellerProducts = await Product.find({ sellerId }).select("_id");

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.status(404).json({ error: "No products found for this seller." });
    }

    // Extract product IDs
    const sellerProductIds = sellerProducts.map((product) => product._id);

    // Find orders that include any of the seller's products
    const orders = await Order.find({
      "orderItems.productId": { $in: sellerProductIds },
    }).populate("orderItems.productId", "name price imageUrls") // Populate product details
      .populate("userId", "fullName email phone"); // Optionally populate user details

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this seller's products." });
    }

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params; // Extract order ID from route parameters

    // Find the order by its ID
    const order = await Order.findById(orderId)
      .populate("orderItems.productId", "name price imageUrls") // Populate product details
      .populate("userId", "name email"); // Populate user details

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.status(200).json(order); // Return the order details
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};