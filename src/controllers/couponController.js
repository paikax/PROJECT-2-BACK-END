const Coupon = require("../models/Coupon");
const cartService = require("../services/cartService"); // Import cartService for cart operations

const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; // Format as dd/mm/yyyy
};

// Create a coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, minCartPrice, validity, description } = req.body;
    const formattedValidity = formatDate(validity); // Format the date
    const coupon = new Coupon({
      code,
      discount,
      minCartPrice,
      validity: formattedValidity,
      description,
      adminId: req.user.id,
    });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { code, discount, minCartPrice, validity, description } = req.body;
    const formattedValidity = formatDate(validity); // Format the date
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { code, discount, minCartPrice, validity: formattedValidity, description },
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.status(200).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("adminId", "fullName");
    // Format validity dates for response
    const formattedCoupons = coupons.map(coupon => ({
      ...coupon._doc,
      validity: formatDate(coupon.validity), // Format the date
    }));
    res.status(200).json(formattedCoupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate("adminId", "fullName");
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.status(200).json({
      ...coupon._doc,
      validity: formatDate(coupon.validity), // Format the date
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    if (coupon.adminId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this coupon" });
    }

    await Coupon.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Apply a coupon to the user's cart
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    // Fetch the user's cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty. Cannot apply a coupon." });
    }

    // Calculate the total price of the cart
    const totalPrice = cart.items.reduce((sum, item) => {
      const variantPrice = item.variantDetails
        ? parseFloat(item.variantDetails.price)
        : parseFloat(item.product.price);
      return sum + item.count * variantPrice;
    }, 0);

    // Fetch the coupon and validate it
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon || coupon.validity < formatDate(new Date())) { // Check validity
      return res.status(400).json({ error: "Invalid or expired coupon code." });
    }

    // Ensure the total price meets the coupon's minimum cart price
    if (totalPrice < coupon.minCartPrice) {
      return res.status(400).json({
        error: `Coupon requires a minimum cart price of ${coupon.minCartPrice}. Your cart total is ${totalPrice}.`,
      });
    }

    // Apply the coupon to the cart
    const updatedCart = await cartService.applyCouponToCart(userId, couponCode);

    // Return the updated cart with the applied coupon
    res.status(200).json({
      message: "Coupon applied successfully.",
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        minCartPrice: coupon.minCartPrice,
        validity: coupon.validity,
        description: coupon.description,
      },
      cart: updatedCart,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};