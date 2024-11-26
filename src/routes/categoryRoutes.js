const express = require('express');
const categoryController = require('../controllers/categoryController');
const {verifyToken} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const router = express.Router();

// Category CRUD routes
router.post('/', verifyToken, authorizeRole('admin'), categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', verifyToken, authorizeRole('admin'), categoryController.updateCategory);
router.delete('/:id', verifyToken, authorizeRole('admin'), categoryController.deleteCategory);

// Request and verify routes for Category
router.post('/request', verifyToken, requestController.createRequest);  // Create request for category
module.exports = router;