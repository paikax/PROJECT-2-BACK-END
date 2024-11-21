const express = require('express');
const userController = require('../controllers/usersController');
const router = express.Router();
const {verifyToken, addToBlacklist} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');


// Get all users (Admin route)
router.get('/admin',
    verifyToken,
    authorizeRole("admin"), (req, res) => {
    res.json({message: 'admin'});
});


router.get('/users',
    verifyToken,
    authorizeRole("admin"),
    userController.getAllUsers);

// Both admin and manager can access this router
router.get('/seller', verifyToken, (req, res) => {
    res.json({message: 'seller'});
});

// All can access this route
router.get('/all',
    verifyToken,
    authorizeRole("admin", "seller", "user"),
    (req, res) => {
    res.json({message: 'all'});
});
// Get single user
router.get('/user/:id', verifyToken, userController.getUser);
// Update user
router.put('/user/:id', verifyToken, userController.updateUser);
// Delete user
router.delete('/user/:id', verifyToken, userController.deleteUser);
// Request password reset
router.post('/user/forgot-password', userController.forgotPassword);
// Reset password
router.post('/user/reset-password', userController.resetPassword);
// Refresh token
router.post('/refresh-token', userController.refreshToken);
// ban user
router.post(
    '/admin/ban-user',
    verifyToken,
    authorizeRole("admin"),
    userController.banUser
  );
// show the report of that user
router.get('/admin/report/:id', verifyToken, 
    authorizeRole("admin"), 
    userController.getUserReportFlags);
    // delete report by id


router.delete('/admin/report/:id', verifyToken, 
        authorizeRole("admin"),
        userController.deleteReportById);



router.post('/user/logout', verifyToken, (req, res) => {
    const token = req.headers.authorization.split('Bearer ')[1];
    addToBlacklist(token);
    res.status(200).json({ message: 'Logout successful' });
});        


module.exports = router;