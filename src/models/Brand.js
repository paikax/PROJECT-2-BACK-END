const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
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

module.exports = mongoose.model('Brand', brandSchema);