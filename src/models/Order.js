const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Paid", "Refunded"],
    default: "Unpaid", // New field to track payment status
  },
  totalQuantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  orderItems: [orderItemSchema],
  reason: { type: String },
  refundAmount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Order", orderSchema);
