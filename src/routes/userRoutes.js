const express = require('express');
const userController = require('../controllers/usersController');
const { checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/auth/signup', userController.register);
// router.get('/auth/confirm/:token', authController.confirmEmail);
router.post('/auth/confirm', userController.confirmEmail);
router.post('/auth/signin', userController.login);

// Get all users (Admin route)
router.get('/users', checkRole(['admin']), userController.getAllUsers);

// Get single user
router.get('/user/:id', userController.getUser);

// Update user
router.put('/user/:id', userController.updateUser);

// Delete user
router.delete('/user/:id', userController.deleteUser);

// Request password reset
router.post('/auth/forgot-password', userController.forgotPassword);

// Reset password
router.post('/auth/reset-password', userController.resetPassword);

module.exports = router;