const mongoose = require("mongoose");

// Utility function to count words in a string
function wordCount(value) {
  return value.split(/\s+/).length;
}

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
  description: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return wordCount(value) <= 500; // Limit description to 500 words
      },
      message: "Description cannot exceed 500 words.",
    },
  },
  imageUrls: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
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
      attributes: {
        option: { type: String }, // Example: "16gb-256gb"
        color: { type: String }, // Example: "black" or "white"
      },
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  verify: {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    description: {
      type: String,
      default: "This product is under review. Please wait...",
    },
    reason: {
      type: String,
    },
  },
  views: {
    type: Number,
    default: 0,
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
});

// Add custom validation for imageUrls to limit the array to 5 items
productSchema.path("imageUrls").validate(function (value) {
  return value.length <= 5;
}, "You can only upload a maximum of 5 images.");

module.exports = mongoose.model("Product", productSchema);
