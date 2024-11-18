const User = require('../models/User');
const emailService = require('./emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async () => {
  try {
    return await User.find();
  } catch (err) {
    throw new Error('Failed to retrieve users');
  }
};

// Get a user by ID
exports.getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (err) {
    throw new Error('Failed to retrieve user');
  }
};

// Update a user by ID
exports.updateUser = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Step 1: Ensure email is not in the update data, remove it if present
    if (updateData.email) {
      throw new Error('Email cannot be updated.');
    }

    // Step 2: Validate that only allowed fields are present in the update data
    const allowedUpdates = ['password', 'dateOfBirth', 'phone', 'address', 'gender', 'imageUrl'];
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

    // Step 4: Save the updated user
    await user.save();
    return user;
  } catch (err) {
    throw new Error('Failed to update user: ' + err.message);
  }
};

// Delete a user by ID
exports.deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('User not found');
    return user;
  } catch (err) {
    throw new Error('Failed to delete user');
  }
};

// send a reset pass email
exports.sendPasswordResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found.');
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.confirmationToken = resetToken; // Reuse confirmationToken field
  await user.save();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await emailService.sendPasswordResetEmail(email, resetUrl);
};

// reset user password when forget
exports.resetPassword = async (token, currentPassword, newPassword) => {
  const user = await User.findOne({ confirmationToken: token });
  if (!user) throw new Error('Invalid or expired token.');
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new Error('Current password is incorrect.');
  }
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  user.password = newPassword;
  user.confirmationToken = undefined;
  await user.save();
};

exports.resetPassword = async (token, currentPassword, newPassword) => {
  const user = await User.findOne({ confirmationToken: token });
  if (!user) throw new Error('Invalid or expired token.');
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new Error('Current password is incorrect.');
  }
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  user.password = newPassword;
  user.confirmationToken = undefined;
  await user.save();
};