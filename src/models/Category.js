const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: 
    {
      type: String,
      required: true,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  verify: {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
        default: null
    },
}
});

module.exports = mongoose.model('Category', categorySchema);