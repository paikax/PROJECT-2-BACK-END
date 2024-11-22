const express = require('express');
const authController = require('../controllers/authController');
const checkBanStatus = require('../middleware/checkBanStatus');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for managing categories
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user by providing fullName, email, password, etc.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
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
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful, an email will be sent for confirmation
 *       400:
 *         description: Bad request or validation error
 */
router.post('/auth/signup', authController.register);
// router.get('/auth/confirm/:token', authController.confirmEmail);


/**
 * @swagger
 * /auth/confirm:
 *   post:
 *     summary: Confirm user email
 *     description: Confirms the user's email address using a token received by email.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: The token for email confirmation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email successfully confirmed, the user can now log in
 *       400:
 *         description: Invalid token or other error
 */
router.post('/auth/confirm', authController.confirmEmail);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Login an existing user
 *     description: Authenticates an existing user by email and password, returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *       400:
 *         description: Invalid credentials or other issues
 */
router.post('/auth/signin', checkBanStatus, authController.login);

module.exports = router;