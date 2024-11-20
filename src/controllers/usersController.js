const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

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
    const { token, newPassword } = req.body;

    // Validate newPassword
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    await userService.resetPassword(token, newPassword);
    res.status(200).send('Password reset successfully.');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '3m' }
    );

    res.json({ accessToken });
  });
};

exports.banUser = async (req, res) => {
  const { userId, isBanned } = req.body;

  // Validate inputs
  if (typeof isBanned !== 'boolean') {
    return res.status(400).json({ error: "Invalid value for 'isBanned'. It must be a boolean." });
  }

  try {
    // Call the service to update the ban status
    const updatedUser = await userService.setBanStatus(userId, isBanned);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: `User has been successfully ${isBanned ? 'banned' : 'unbanned'}.`,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the user status: " + err.message });
  }
};





