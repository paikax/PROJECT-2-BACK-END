const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Discount", discountSchema);