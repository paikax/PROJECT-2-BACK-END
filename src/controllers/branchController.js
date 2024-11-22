const Branch = require('../models/Branch'); // Import Branch model

// Create Branch
exports.createBranch = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    // Create a new branch
    const branch = new Branch({
      name,
      description,
      imageUrl,
    });

    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Branches
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json(branches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Single Branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.status(200).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Branch
exports.updateBranch = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Update the branch details
    branch.name = name || branch.name;
    branch.description = description || branch.description;
    branch.imageUrl = imageUrl || branch.imageUrl;

    await branch.save();
    res.status(200).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Branch
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    await branch.deleteOne();
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};