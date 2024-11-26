const express = require('express');
const branchController = require('../controllers/branchController');
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for Branch CRUD

router.post('/', verifyToken, authorizeRole('seller', 'admin'), branchController.createBranch);
router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);
router.put('/:id', verifyToken, authorizeRole('seller', 'admin'), branchController.updateBranch);
router.delete('/:id', verifyToken, authorizeRole('admin'), branchController.deleteBranch);
// Request and verify routes for Branch
router.post('/request', verifyToken, requestController.createRequest);  // Create request for branch
module.exports = router;