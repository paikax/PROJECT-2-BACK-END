const Coupon = require("../models/Coupon");

// Create a coupon
exports.createCoupon = async (req, res) => {
    try {
      const { code, discount, validity, description, minItemCount} = req.body;
      const coupon = new Coupon({ code, discount, validity, description, adminId: req.user.id ,  minItemCount});
      await coupon.save();
      res.status(201).json(coupon);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  // Update a coupon
  exports.updateCoupon = async (req, res) => {
    try {
      const { code, discount, validity, description, minItemCount } = req.body;
      const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { code, discount, validity, description },
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
    res.status(200).json(coupons);
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
    res.status(200).json(coupon);
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
    
    await coupon.remove();
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};