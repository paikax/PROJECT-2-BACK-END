const express = require('express');
const userController = require('../controllers/usersController');
const {verifyToken, addToBlacklist} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for User Management
router.get('/admin', verifyToken, authorizeRole('admin'), userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

// Request routes for users
router.post('/request', verifyToken, requestController.createRequest);

module.exports = router;