const userService = require("../services/userService");
const productService = require("../services/productService");
const jwt = require("jsonwebtoken");
const {
  addToBlacklist,
  removeFromBlacklist,
} = require("../middleware/authMiddleware");

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
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update user details, including password
exports.updateUser = async (req, res) => {
  const {
    currentPassword,
    newPassword,
    dateOfBirth,
    phone,
    address,
    gender,
    imageUrl,
    fullName,
  } = req.body;

  try {
    // Get the authenticated user (assuming `req.user` is populated by middleware)
    const userId = req.user.id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If password update is requested, delegate to a separate service
    if (newPassword) {
      await userService.updatePassword(userId, currentPassword, newPassword);
    }

    // Update other fields
    const updatedFields = {
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      phone: phone || user.phone,
      address: address || user.address,
      gender: gender || user.gender,
      imageUrl: imageUrl || user.imageUrl,
      fullName: fullName || user.fullName,
    };

    Object.assign(user, updatedFields);
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.sendPasswordResetEmail(email);
    res.status(200).send("Password reset email sent.");
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
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    await userService.resetPassword(token, newPassword);
    res.status(200).send("Password reset successfully.");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not provided" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3m" }
    );

    res.json({ accessToken });
  });
};

exports.banUser = async (req, res) => {
  const { userId, isBanned } = req.body;

  // Validate inputs
  if (typeof isBanned !== "boolean") {
    return res
      .status(400)
      .json({ error: "Invalid value for 'isBanned'. It must be a boolean." });
  }

  try {
    // Call the service to update the ban status for the target user
    const updatedUser = await userService.setBanStatus(userId, isBanned);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // If banning another user, only blacklist their token(s), not the current user's
    if (isBanned) {
      // Fetch the target user's token (if stored in DB, for example)
      const userTokens = await userService.getUserTokens(userId); // Assume you have a service to get user tokens
      userTokens.forEach((token) => addToBlacklist(token));
    } else {
      // If unbanning, remove their tokens from the blacklist
      const userTokens = await userService.getUserTokens(userId);
      userTokens.forEach((token) => removeFromBlacklist(token));
    }

    res.status(200).json({
      message: `User has been successfully ${
        isBanned ? "banned" : "unbanned"
      }.`,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while updating the user status: " + err.message,
    });
  }
};

exports.getUserReportFlags = async (req, res) => {
  const userId = req.params.id; 

  try {
    const reportDetails = await userService.getUserReportFlags(userId);
    res.status(200).json(reportDetails);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReportById = async (req, res) => {
  const reportId = req.params.id; // Get report ID from URL

  try {
    const updatedProduct = await productService.deleteReportById(reportId);
    res.status(200).json({
      message: "Report deleted successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.adminUpdateUser = async (req, res) => {
  const { userId, fullName, dateOfBirth, phone, address, gender, role } =
    req.body;

  try {
    // Check if the user is admin (middleware should ensure the token is valid and has admin role)
    const userRole = req.user.role; // Assuming the role is added to req.user in the middleware

    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Admin access required" });
    }

    // Get the user that needs to be updated
    const userToUpdate = await userService.getUserById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare the fields to update
    const updatedFields = {
      fullName: fullName || userToUpdate.fullName,
      dateOfBirth: dateOfBirth || userToUpdate.dateOfBirth,
      phone: phone || userToUpdate.phone,
      address: address || userToUpdate.address,
      gender: gender || userToUpdate.gender,
      role: role || userToUpdate.role,
    };

    // Apply the update
    Object.assign(userToUpdate, updatedFields);
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User updated successfully", user: userToUpdate });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user: " + err.message });
  }
};
