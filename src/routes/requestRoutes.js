const express = require('express');
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: API for managing requests
 */


// Tạo request mới
/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - targetId
 *               - title
 *               - reason
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [product, user, category, brand]
 *                 description: Type of the request
 *               targetId:
 *                 type: string
 *                 description: ID of the target object
 *               title:
 *                 type: string
 *                 description: Title of the request
 *               reason:
 *                 type: string
 *                 description: Reason for the request
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the created request
 *       400:
 *         description: Bad request
 *       404:
 *         description: Target not found
 */
router.post('/requests', verifyToken, authorizeRole('user','seller'), requestController.createRequest);

// Lấy danh sách request (admin/seller/user)
/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests with optional filters
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by request type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by request status
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Filter by keyword in title
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   title:
 *                     type: string
 *                   status:
 *                     type: string
 *       400:
 *         description: Bad request
 */
router.get('/requests', verifyToken, requestController.getAllRequests);

// Lấy chi tiết request
/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get details of a specific request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the request
 *     responses:
 *       200:
 *         description: Request details retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 */
router.get('/requests/:id', verifyToken, requestController.getRequestById);

// Cập nhật request (admin xử lý)
/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Update a request's result and feedback
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: New result of the request
 *               feedback:
 *                 type: string
 *                 description: Feedback or comment for the request
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Request not found
 */
router.put('/requests/:id', verifyToken, authorizeRole('admin'), requestController.updateRequest);

module.exports = router;
