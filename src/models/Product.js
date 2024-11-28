const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
    min: 0,
  },
  descriptionFileUrl: {
    type: String,
    required: true,
  },
  information: {},
  imageUrls: [
    {
      type: String,
      required: true,
    },
  ],
  variants: [
    {
      price: {
        type: String,
        required: true,
        min: 0,
      },
      stockQuantity: {
        type: String,
        required: true,
        min: 0,
      },
    },
  ],
  attributes: [
    {
      value: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  views: {
    type: Number,
    min: 0,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  reportId: {
    type: String,
    default: null,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
