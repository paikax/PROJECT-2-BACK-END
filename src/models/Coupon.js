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
    min: 0, // Discount amount
  },
  minCartPrice: {
    type: Number,
    required: true, // Minimum cart price required to use this coupon
    min: 0,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Ensure the coupon is associated with an admin
  },
  endDate: {
    type: Date,
    required: true, // Expiry date of the coupon
  },
  description: {
    type: String,
    required: true, // Description of the coupon
  },
  startDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
