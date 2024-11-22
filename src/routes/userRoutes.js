const express = require('express');
const userController = require('../controllers/usersController');
const router = express.Router();
const {verifyToken, addToBlacklist} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing categories
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users (Admin only).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users list
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       403:
 *         description: Forbidden, user does not have admin role
 *       400:
 *         description: Bad request or server error
 */
router.get('/users',
    verifyToken,
    authorizeRole("admin"),
    userController.getAllUsers);

// Get single user
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Retrieve a single user's details by their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request or server error
 */
router.get('/users:id', verifyToken, userController.getUser);

// Update user
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     description: Update the user details such as phone, address, and password.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               gender:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user details
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request or validation error
 *       500:
 *         description: Internal server error
 */
router.put('/users/:id', verifyToken, userController.updateUser);

// Delete user
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a user from the system by their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request or server error
 */
router.delete('/users/:id', verifyToken, userController.deleteUser);

// Request password reset
/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     description: Sends a password reset email to the user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid email or error occurred
 */
router.post('/users/forgot-password', userController.forgotPassword);

// Reset password
/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Reset the password using a token sent via email.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or validation error
 */
router.post('/users/reset-password', userController.resetPassword);

// Refresh token
/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh user JWT token
 *     description: Refreshes the JWT access token using the provided refresh token.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully refreshed access token
 *       401:
 *         description: Unauthorized, no refresh token provided
 *       403:
 *         description: Forbidden, invalid refresh token
 */
router.post('/users/refresh-token', userController.refreshToken);

// ban user
/**
 * @swagger
 * /admin/ban-user:
 *   post:
 *     summary: Ban or unban a user
 *     description: Ban or unban a user by their ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userId
 *         in: body
 *         required: true
 *         description: The ID of the user to ban or unban
 *         schema:
 *           type: string
 *       - name: isBanned
 *         in: body
 *         required: true
 *         description: Boolean value indicating whether to ban or unban the user
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Successfully banned or unbanned the user
 *       400:
 *         description: Invalid input or server error
 */
router.post(
    '/admin/ban-user',
    verifyToken,
    authorizeRole("admin"),
    userController.banUser
  );


// show the report of that user
/**
 * @swagger
 * /admin/report/{id}:
 *   get:
 *     summary: Get user report flags
 *     description: Get all report flags for a specific user.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user whose report flags are to be retrieved
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user report flags
 *       400:
 *         description: Error retrieving report flags
 */
router.get('/admin/report/:id', verifyToken, 
    authorizeRole("admin"), 
    userController.getUserReportFlags);
    // delete report by id

/**
 * @swagger
 * /admin/report/{id}:
 *   delete:
 *     summary: Delete report by ID
 *     description: Delete a specific user report by its ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the report to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted report
 *       400:
 *         description: Error deleting report
 */
router.delete('/admin/report/:id', verifyToken, 
        authorizeRole("admin"),
        userController.deleteReportById);


/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user and add token to blacklist
 *     description: Logs out a user and invalidates the current JWT token by adding it to the blacklist.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Error during logout
 */
router.post('/users/logout', verifyToken, (req, res) => {
    const token = req.headers.authorization.split('Bearer ')[1];
    addToBlacklist(token);
    res.status(200).json({ message: 'Logout successful' });
});        


module.exports = router;