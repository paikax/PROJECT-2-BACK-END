/**
 * Request Routes
 *
 * This file defines the API routes for managing verification requests.
 *
 * Route Definitions:
 *
 * 1. `POST /`: Create a new request.
 *    - Middleware: 
 *        - `verifyToken`: Verifies user authentication.
 *        - `validateRequestType`: Ensures the request type is valid.
 *    - Controller: `requestController.createRequest`
 *
 * 2. `GET /`: Retrieve all requests (admin only).
 *    - Middleware: 
 *        - `verifyToken`: Verifies user authentication.
 *        - `isAdmin`: Restricts access to admin users.
 *    - Controller: `requestController.getAllRequests`
 *
 * 3. `GET /:id`: Fetch a request by its ID.
 *    - Middleware:
 *        - `verifyToken`: Verifies user authentication.
 *        - `validateRequestAccess`: Validates access to the request.
 *    - Controller: `requestController.getRequestById`
 *
 * 4. `PATCH /:id/status`: Update the status of a request (admin only).
 *    - Middleware:
 *        - `verifyToken`: Verifies user authentication.
 *        - `isAdmin`: Restricts access to admin users.
 *        - `updateTargetStatus`: Validates and updates the target status.
 *        - `autoCreateRequest`: Automatically creates related requests for admin actions.
 *    - Controller: `requestController.updateRequestStatus`
 *
 * 5. `POST /:id/verify`: Verify a request (admin only).
 *    - Middleware:
 *        - `verifyToken`: Verifies user authentication.
 *        - `isAdmin`: Restricts access to admin users.
 *    - Controller: `requestController.verifyRequest`
 *
 * 6. `GET /user/requests`: Retrieve requests created by the currently authenticated user.
 *    - Middleware:
 *        - `verifyToken`: Verifies user authentication.
 *    - Controller: `requestController.getUserRequests`
 *
 * Dependencies:
 * - `express`: For defining routes and handling HTTP requests.
 * - `requestController`: Contains the controller methods for handling request operations.
 * - Middleware:
 *    - `verifyToken`: Authentication middleware.
 *    - `isAdmin`: Admin role validation middleware.
 *    - `validateRequestAccess`: Validates user access to a specific request.
 *    - `validateRequestType`: Validates the request type.
 *    - `updateTargetStatus`: Updates target status dynamically.
 *    - `autoCreateRequest`: Automates admin-related request creation.
 */

const express = require('express');
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
    validateRequestAccess,
    validateRequestType,
    updateTargetStatus,
    autoCreateRequest,
    checkOverdueRequest,
} = require('../middleware/requestMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');
const paginationMiddleware = require("../middleware/paginationMiddleware");

const router = express.Router();

// Routes for managing requests
router.post('/request/', verifyToken, validateRequestType, requestController.createRequest);
router.get('/request/', verifyToken, isAdmin, paginationMiddleware, requestController.getAllRequests, requestController.getAllRequestsWithFilter, requestController.checkOverdueRequest);
router.get('/request/:id', verifyToken, validateRequestAccess, requestController.getRequestById);
router.patch('/request/:id/status', verifyToken, isAdmin, checkOverdueRequest, updateTargetStatus, autoCreateRequest, requestController.updateRequestStatus);
router.post('/request/:id/verify', verifyToken, isAdmin, requestController.verifyRequest);
router.get('/request/user/:id', verifyToken, requestController.getUserRequests);

module.exports = router;
