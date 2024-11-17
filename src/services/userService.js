const User = require('../models/User');

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