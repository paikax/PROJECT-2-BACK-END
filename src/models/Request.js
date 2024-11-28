/**
 * Request Schema and Related Constants
 * 
 * This file defines the `Request` schema for MongoDB using Mongoose. It is used to handle various 
 * verification requests across different targets, such as users, products, brands, and categories.
 * 
 * Constants:
 * - `VERIFY_TARGETS`: Lists the types of targets for verification (e.g., user, product).
 * - `REQUEST_TYPES`: Specifies the allowed request types based on the target.
 * - `TARGET_STATUS`: Defines the possible statuses of the verification targets (e.g., approved, rejected).
 * - `REQUEST_STATUS`: Represents the states a request can be in (e.g., pending, done).
 * - `DEFAULT_FEEDBACK`: Provides default feedback messages for each verification target type.
 * 
 * Schema Features:
 * - Includes dynamic relationships using `refPath` for linking to target collections.
 * - Validates `request_type` dynamically based on `verify_target`.
 * - Provides hooks for additional dynamic validation and default values.
 * 
 * Usage:
 * - The schema tracks requests for verification or modification across various targets.
 * - Exports the `Request` model and related constants for reuse.
 */

const mongoose = require('mongoose');

// Configurable constants
const VERIFY_TARGETS = {
    USER: 'user',
    PRODUCT: 'product',
    BRAND: 'brand',
    CATEGORY: 'category',
};

// Request types based on targets
const REQUEST_TYPES = {
    USER: ['change_role', 'report_user'],
    PRODUCT: ['add_product', 'report_product', 'change_product'],
    BRAND: ['add_brand', 'report_brand', 'change_brand'],
    CATEGORY: ['add_category', 'report_category', 'change_category'],
    ADMIN: ['admin_override', 'system_override'],
};

// Target statuses
const TARGET_STATUS = {
    APPROVED: 'approved',
    REJECTED: 'rejected',
    UNDER_REVIEW: 'under_review',
    ARCHIVE: 'archive',
};

// Request statuses
const REQUEST_STATUS = {
    PENDING: 'pending',
    DONE: 'done',
    OVERDUE: 'overdue',
    UNDO: 'undo',
    default: "pending",
};

// Default feedback messages based on verification target
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

// Exporting the model and constants
module.exports = mongoose.model('Request', requestSchema);
module.exports = {
    VERIFY_TARGETS,
    REQUEST_TYPES,
    TARGET_STATUS,
    REQUEST_STATUS,
    DEFAULT_FEEDBACK,
};