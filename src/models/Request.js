const mongoose = require('mongoose');

// Configurable constants
const VERIFY_TARGETS = {
    USER: 'user',
    PRODUCT: 'product',
    BRAND: 'brand',
    CATEGORY: 'category',
};

// Xác định các loại request dựa trên mục tiêu
const REQUEST_TYPES = {
    USER: ['change_role', 'report_user'],
    PRODUCT: ['add_product', 'report_product', 'change_product'],
    BRAND: ['add_brand', 'report_brand', 'change_brand'],
    CATEGORY: ['add_category', 'report_category', 'change_category'],
    ADMIN: ['admin_override', 'system_override'],
};

// Các trạng thái mục tiêu
const TARGET_STATUS = {
    APPROVED: 'approved',
    REJECTED: 'rejected',
    UNDER_REVIEW: 'under_review',
    ARCHIVE: 'archive',
};

// Các trạng thái request
const REQUEST_STATUS = {
    PENDING: 'pending',
    DONE: 'done',
    OVERDUE: 'overdue',
    UNDO: 'undo',
};

// Phản hồi mặc định theo mục tiêu xác minh
const DEFAULT_FEEDBACK = {
    [VERIFY_TARGETS.USER]: 'This user is under review. Please wait...',
    [VERIFY_TARGETS.PRODUCT]: 'This product is under review. Please wait...',
    [VERIFY_TARGETS.BRAND]: 'This brand is under review. Please wait...',
    [VERIFY_TARGETS.CATEGORY]: 'This category is under review. Please wait...',
};


// Schema definition
const requestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    verify_target: {
      type: String,
      enum: Object.values(VERIFY_TARGETS),
      required: true,
    },

    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'verify_target', // Dynamically links to the related collection
    },

    target_status: {
      type: String,
      enum: Object.values(TARGET_STATUS),
      default: TARGET_STATUS.UNDER_REVIEW,
    },

    request_type: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },

    feedback: {
      type: String,
      default: function () {
        return DEFAULT_FEEDBACK[this.verify_target] || 'This item is under review.';
      },
    },

    additional_info: {
      type: Map,
      of: String, // Can hold additional key-value information
    },

    previous_target_status: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Schema hooks for dynamic validation and default values
requestSchema.pre('validate', function (next) {
  // Validate request_type based on verify_target
  const validRequestTypes = [...REQUEST_TYPES.USER, ...REQUEST_TYPES.PRODUCT, ...REQUEST_TYPES.ADMIN];
  if (!validRequestTypes.includes(this.request_type)) {
    return next(new Error('Invalid request type.'));
  }

  next();
});

// Exporting the model
module.exports = mongoose.model('Request', requestSchema);
module.exports = {
    VERIFY_TARGETS,
    REQUEST_TYPES,
    TARGET_STATUS,
    REQUEST_STATUS,
    DEFAULT_FEEDBACK,
};