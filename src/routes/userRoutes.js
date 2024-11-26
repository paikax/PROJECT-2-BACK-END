const express = require('express');
const userController = require('../controllers/usersController');
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// User CRUD routes
router.get('/admin', verifyToken, authorizeRole('admin'), userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

// Request and verify routes for User
router.post('/request', verifyToken, requestController.createRequest);  // Create request for user
module.exports = router;
