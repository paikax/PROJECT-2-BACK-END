const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./emailService');
const jwt = require('jsonwebtoken');

exports.registerUser = async (email, password, dateOfBirth, gender) => {
  // Validate the input fields
  if (!email || !password || !dateOfBirth || !gender) {
    throw new Error('All fields are required.');
  }
  
  // Validate email format
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format.');
  }
  
  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered.');

  }
  
  // Validate password strength
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  
  // Validate date of birth (user must be at least 18 years old)
  const dob = new Date(dateOfBirth);
  const age = new Date().getFullYear() - dob.getFullYear();
  if (age < 18) {
    throw new Error('You must be at least 18 years old.');
  }

  // Validate gender
  if (!['male', 'female', 'other'].includes(gender)) {
    throw new Error('Invalid gender. Must be one of "male", "female", or "other".');
  }

  // Generate a confirmation token and create the user
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  const user = new User({ email, password, dateOfBirth, gender, confirmationToken });
  
  await user.save();
  await emailService.sendConfirmationEmail(email, confirmationToken);
  
  return user;
};

exports.confirmUserEmail = async (token) => {
  const user = await User.findOne({ confirmationToken: token });
  if (!user) throw new Error('Invalid or expired token.');
  
  user.isConfirmed = true;
  user.confirmationToken = undefined;
  await user.save();
  
  return user;
};

exports.loginUser = async (email, password) => {
  // Validate the email and password
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password.');
  
  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password.');
  }
  
  if (!user.isConfirmed) {
    throw new Error('Please confirm your email first.');
  }
  
  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};


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
    const allowedUpdates = ['password', 'dateOfBirth', 'gender', 'imageUrl'];
    const updateFields = Object.keys(updateData);
    for (let field of updateFields) {
      if (!allowedUpdates.includes(field)) {
        throw new Error(`${field} is not a valid field for update.`);
      }
    }

    // Step 3: Apply valid updates
    if (updateData.password) user.password = updateData.password;
    if (updateData.dateOfBirth) user.dateOfBirth = updateData.dateOfBirth;
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