const express = require('express');
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Tạo request mới
router.post('/requests', verifyToken, authorizeRole('user', 'seller'), requestController.createRequest);

// Lấy danh sách request (admin/seller/user)
router.get('/requests', verifyToken, requestController.getAllRequests);

// Lấy tất cả request của người dùng hiện tại
router.get('/requests/user', verifyToken, requestController.getRequestsByUser); // Move this route up

// Lấy chi tiết request
router.get('/requests/:id', verifyToken, requestController.getRequestById); // Move this route down

// Cập nhật request (admin xử lý)
router.put('/requests/:id', verifyToken, authorizeRole('admin'), requestController.updateRequest);

// Approve a request (admin only)
router.put('/requests/:id/approve', verifyToken, authorizeRole('admin'), requestController.approveRequest);

// Reject a request (admin only)
router.put('/requests/:id/reject', verifyToken, authorizeRole('admin'), requestController.rejectRequest);

module.exports = router;