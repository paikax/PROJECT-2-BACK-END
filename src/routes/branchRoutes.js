const express = require('express');
const branchController = require('../controllers/branchController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for Branch CRUD

// Create a branch (only sellers and admins can create)
router.post(
  '/',
  verifyToken,
  authorizeRole('seller', 'admin'), // Only sellers and admins can create branches
  branchController.createBranch
);

// Get all branches (accessible to everyone)
router.get('/', branchController.getAllBranches);

// Get single branch by ID (accessible to everyone)
router.get('/:id', branchController.getBranchById);

// Update a branch (only sellers and admins can update)
router.put(
  '/:id',
  verifyToken,
  authorizeRole('seller', 'admin'), // Only sellers and admins can update branches
  branchController.updateBranch
);

// Delete a branch (only admins can delete)
router.delete(
  '/:id',
  verifyToken,
  authorizeRole('seller','admin'), // Only admins can delete branches
  branchController.deleteBranch
);

module.exports = router;