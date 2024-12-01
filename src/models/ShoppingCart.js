const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: String, // Store only the variantId as a string
    required: false, // Optional if no variants are selected
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
    deliveryAddress: { type: String}, // New field
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
