const userService = require('../services/userService');


exports.register = async (req, res) => {
  try {
    const { email, password, dateOfBirth, phone, address, gender, role } = req.body;
    await userService.registerUser(email, password, dateOfBirth, phone, address, gender, role);
    res.status(201).send('Registration successful! Please check your email to confirm your account.');
  } catch (err) {
    // Send a more specific error message from the exception
    res.status(400).json({ error: err.message });
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;

    await userService.confirmUserEmail(token);
    res.status(200).send('Email confirmed! You can now log in.');
  } catch (err) {
    // Send a more specific error message from the exception
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await userService.loginUser(email, password);
    res.status(200).json({ token });
  } catch (err) {
    // Send a more specific error message from the exception
    res.status(400).json({ error: err.message });
  }
};

// Get all users (for admin only, maybe add role checking in the future)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { password, dateOfBirth, phone, address, gender, imageUrl } = req.body;
  try {
    const updatedUser = await userService.updateUser(req.params.id, { password, dateOfBirth, phone, address, gender, imageUrl });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.sendPasswordResetEmail(email);
    res.status(200).send('Password reset email sent.');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;
    await userService.resetPassword(token, currentPassword, newPassword);
    res.status(200).send('Password reset successfully.');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};