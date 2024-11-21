const express = require('express');
const categoryController = require('../controllers/categoryController');
const {verifyToken} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for category CRUD
router.post('/categories', verifyToken, authorizeRole('admin'), categoryController.createCategory);
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategory);
router.put('/categories/:id', verifyToken, authorizeRole('admin'), categoryController.updateCategory);
router.delete('/categories/:id', verifyToken, authorizeRole('admin'), categoryController.deleteCategory);

module.exports = router;