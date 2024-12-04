const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Ensure coupon codes are unique
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Ensure the coupon is associated with a admin
  },
  validity: {
    type: Date,
    required: true,
  },
  minItemCount: {
    type: Number,
    required: true,
    min: 0, // Minimum items required to apply this coupon
  },
  description: {
    type: String,
    required: true, // Make description required
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);