const express = require('express');
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
    validateRequestAccess,
    validateRequestType,
    updateTargetStatus,
    autoCreateRequest,
} = require('../middleware/requestMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for managing requests
router.post('/', verifyToken, validateRequestType, requestController.createRequest);
router.get('/', verifyToken, isAdmin, requestController.getAllRequests);
router.get('/:id', verifyToken, validateRequestAccess, requestController.getRequestById);
router.patch('/:id/status', verifyToken, isAdmin, updateTargetStatus, autoCreateRequest, requestController.updateRequestStatus);
router.post('/:id/verify', verifyToken, isAdmin, requestController.verifyRequest);
router.get('/user/requests', verifyToken, requestController.getUserRequests);

module.exports = router;
