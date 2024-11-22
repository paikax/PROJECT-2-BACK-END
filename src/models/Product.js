const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
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
      name: {
        type: String,
        required: true,
      },
      stockQuantity: {
        type: Number,
        required: true,
        min: 0,
      },
      additionalData: {
        // New field for additional data
        type: String,
      },
    },
  ],
  attributes: [
    {
      name: {
        type: String,
        required: true,
      },
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
  verify: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    description: {
      type: String,
      default: 'This product is under review. Please wait...',
    },
    reason: {
      type: String,
    },
  },
  views: {
    type: Number,
    min: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  branch: {
    // Reference to the Branch model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true, // Optional field
  },
  information: {
    // New field for additional product information
    type: String,
  },
});

module.exports = mongoose.model('Product', productSchema);