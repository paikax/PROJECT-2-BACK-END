const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const ProductReport = require("../models/ProductReport"); // Import ProductReport
const User = require("../models/User");
const emailService = require("./emailService");

// const redis = new Redis({
//   host: '127.0.0.1',  // Default Redis host
//   port: 6379,         // Default Redis port
//   // You can add authentication if needed:
//   // password: 'your-redis-password',
//   // db: 0,             // If you're using a specific Redis database
// });

exports.getAllUsers = async () => {
  try {
    return await User.find();
  } catch (err) {
    throw new Error("Failed to retrieve users");
  }
};

// Get a user by ID
exports.getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (err) {
    throw new Error("Failed to retrieve user");
  }
};

// Update a user by ID
exports.updateUser = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Step 1: Ensure email is not in the update data, remove it if present
    if (updateData.email) {
      throw new Error("Email cannot be updated.");
    }

    // Step 2: Validate that only allowed fields are present in the update data
    const allowedUpdates = [
      "password",
      "dateOfBirth",
      "phone",
      "address",
      "gender",
      "imageUrl",
      "fullName",
    ];
    const updateFields = Object.keys(updateData);
    for (let field of updateFields) {
      if (!allowedUpdates.includes(field)) {
        throw new Error(`${field} is not a valid field for update.`);
      }
    }

    // Step 3: Apply valid updates
    if (updateData.password) user.password = updateData.password;
    if (updateData.dateOfBirth) user.dateOfBirth = updateData.dateOfBirth;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.address) user.address = updateData.address;
    if (updateData.gender) user.gender = updateData.gender;
    if (updateData.imageUrl) user.imageUrl = updateData.imageUrl;
    if (updateData.fullName) user.imageUrl = updateData.fullName;

    // Step 4: Save the updated user
    await user.save();
    return user;
  } catch (err) {
    throw new Error("Failed to update user: " + err.message);
  }
};

// Delete a user by ID
exports.deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error("User not found");
    return user;
  } catch (err) {
    throw new Error("Failed to delete user");
  }
};

// send a reset pass email
exports.sendPasswordResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.confirmationToken = resetToken; // Reuse confirmationToken field
  await user.save();
  const resetUrl = `${
    process.env.CLIENT_URL
  }/reset-password?token=${encodeURIComponent(resetToken)}`;

  await emailService.sendPasswordResetEmail(email, resetUrl);
};

// Reset user password when forgotten
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ confirmationToken: token });
  if (!user) throw new Error("Invalid or expired token.");

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
  user.password = newPassword;
  await user.save();
};

exports.setBanStatus = async (userId, isBanned) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    user.isBanned = isBanned;
    await user.save();
    return user;
  } catch (err) {
    throw new Error("Failed to update ban status: " + err.message);
  }
};

exports.getUserReportFlags = async (userId) => {
  try {
    const reports = await ProductReport.find({ user: userId })
      .populate("product", "name")
      .populate("user", "fullName");

    const reportDetails = reports.map((report) => ({
      reportId: report._id,
      productId: report.product._id,
      productName: report.product.name,
      reportedBy: report.user.fullName,
      reason: report.reason,
    }));

    return reportDetails;
  } catch (err) {
    throw new Error("Failed to retrieve report flags: " + err.message);
  }
};

// Update user password
exports.updatePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Verify the current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      throw new Error("Current password is incorrect.");
    }

    // Validate the new password length
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long.");
    }

    // Hash and update the password
    user.password = newPassword;
    await user.save(); // The password will be hashed by the pre('save') hook in the User model
  } catch (err) {
    throw new Error(err.message || "Failed to update password.");
  }
};
exports.updateRoleAndVerify = async (id, role, updates) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    
    // Chỉ cập nhật verify khi role là 'user'
    if (user.role === 'user') {
        // Kiểm tra nếu role có verify, nếu không thì tạo mới
        if (!user.verify) {
            user.verify = {};
        }

        // Cập nhật verify
        user.verify.status = updates.verify.status;  // Cập nhật verify status
        user.verify.requestId = updates.verify.requestId;  // Cập nhật verify requestId
        
        console.log('User role before update:', user.role);
        console.log('Updates:', updates);

        await user.save(); // Lưu người dùng với verify đã cập nhật

        // Nếu muốn thay đổi từ 'user' sang 'seller'
        if (role !== 'seller') {
            user.role = 'seller'; // Thay đổi role thành 'seller'
            await user.save(); // Lưu lại người dùng sau khi thay đổi role
        }
    } else {
        throw new Error('Role must be user to update verify');
    }
};

