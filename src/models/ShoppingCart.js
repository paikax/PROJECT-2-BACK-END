const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: String,
    required: false,
  },
  count: {
    type: Number,
    required: true,
    min: 1,
  },
});

const shoppingCartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    deliveryAddress: { type: String },
    appliedCoupon: { type: String, default: null },
    discountedTotal: { type: Number, default: 0 }, // New field for the discounted total price
    paymentMethod: { type: String }, // Add this line
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);