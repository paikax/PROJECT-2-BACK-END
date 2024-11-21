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


router.get('/',
    verifyToken,
    authorizeRole("admin"),
    userController.getAllUsers);

// Get single user
router.get('/:id', verifyToken, userController.getUser);
// Update user
router.put('/:id', verifyToken, userController.updateUser);
// Delete user
router.delete('/:id', verifyToken, userController.deleteUser);
// Request password reset
router.post('/forgot-password', userController.forgotPassword);
// Reset password
router.post('/reset-password', userController.resetPassword);
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



router.post('/logout', verifyToken, (req, res) => {
    const token = req.headers.authorization.split('Bearer ')[1];
    addToBlacklist(token);
    res.status(200).json({ message: 'Logout successful' });
});        


module.exports = router;