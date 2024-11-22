const Branch = require('../models/Branch');

// Create a branch
exports.createBranch = async (name, description, imageUrl) => {
  // Check if a branch with the same name exists
  const existingBranch = await Branch.findOne({ name });
  if (existingBranch) {
    throw new Error('Branch with this name already exists');
  }

  const branch = new Branch({ name, description, imageUrl });
  await branch.save();
  return branch;
};

// Get all branches
exports.getAllBranches = async () => {
  return await Branch.find();
};

// Get a branch by ID
exports.getBranchById = async (id) => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new Error('Branch not found');
  }
  return branch;
};

// Update a branch
exports.updateBranch = async (id, updates) => {
  const branch = await Branch.findByIdAndUpdate(id, updates, { new: true });
  if (!branch) {
    throw new Error('Branch not found');
  }
  return branch;
};

// Delete a branch
exports.deleteBranch = async (id) => {
  const branch = await Branch.findByIdAndDelete(id);
  if (!branch) {
    throw new Error('Branch not found');
  }
};