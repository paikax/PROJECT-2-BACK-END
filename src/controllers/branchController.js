const branchService = require('../services/branchService');

// Create a branch
exports.createBranch = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const branch = await branchService.createBranch(name, description, imageUrl);
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all branches
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await branchService.getAllBranches();
    res.status(200).json(branches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    res.status(200).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a branch
exports.updateBranch = async (req, res) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    res.status(200).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a branch
exports.deleteBranch = async (req, res) => {
  try {
    await branchService.deleteBranch(req.params.id);
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};