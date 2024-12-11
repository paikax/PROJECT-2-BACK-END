const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
          return emailRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          const phoneRegex = /^[0-9]{10,15}$/; // Simplified phone validation
          return phoneRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    dateOfBirth: {
      type: Date,
      default: new Date("1999-01-01"),
      validate: {
        validator: function (v) {
          return v === null || (v instanceof Date && !isNaN(v));
        },
        message: (props) => `${props.value} is not a valid date!`,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmationToken: {
      type: String,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user", "seller"],
      default: "user",
    },
    verify: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "no request"],
        default: "no request",
      },
      requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
        default: null,
      },
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    reportFlags: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
module.exports = mongoose.model("User", userSchema);
