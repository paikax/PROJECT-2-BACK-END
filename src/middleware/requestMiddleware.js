const Request = require('../models/Request');
const {
    VERIFY_TARGETS,
    REQUEST_TYPES,
    TARGET_STATUS,
    REQUEST_STATUS,
    DEFAULT_FEEDBACK,
} = require('../models/Request');
// Middleware: Kiểm tra quyền truy cập request
exports.validateRequestAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Admin có quyền truy cập tất cả
        if (req.user.role === 'admin') {
            req.request = request;
            return next();
        }

        // Chủ sở hữu request
        if (request.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        req.request = request;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware: Kiểm tra loại request hợp lệ
exports.validateRequestType = (req, res, next) => {
    const requestType = req.body.request_type;

    const isValid = Object.values(REQUEST_TYPES).some((types) => types.includes(requestType));
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid request type' });
    }

    next();
};

// Middleware: Cập nhật trạng thái mục tiêu
exports.updateTargetStatus = async (req, res, next) => {
    try {
        const { target_status, reason, verify_target, target_id } = req.body;

        // Kiểm tra `target_status` hợp lệ
        if (!Object.values(TARGET_STATUS).includes(target_status)) {
            return res.status(400).json({ error: 'Invalid target_status value' });
        }

        if (!VERIFY_TARGETS[verify_target.toUpperCase()] || !target_id) {
            return res.status(400).json({ error: 'Missing or invalid verify_target or target_id' });
        }

        // Tạo phản hồi dựa trên trạng thái
        req.body.feedback = `${verify_target} has been updated to '${target_status}' successfully.`;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware: Tự động tạo request (admin action)
exports.autoCreateRequest = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') return next();

        const { verify_target, target_id, target_status } = req.body;

        if (!VERIFY_TARGETS[verify_target.toUpperCase()] || !target_id || !target_status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newRequest = {
            user_id: req.user.id,
            verify_target,
            target_id,
            target_status,
            request_type: 'admin_override',
            status: REQUEST_STATUS.DONE,
            feedback: DEFAULT_FEEDBACK[verify_target.toUpperCase()] || 'Request is being processed.',
        };

        // Lưu vào cơ sở dữ liệu
        const Request = require('../models/Request');
        await new Request(newRequest).save();

        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware: Kiểm tra trạng thái request
exports.checkRequestStatus = (req, res, next) => {
    const { status } = req.body;

    if (status && ['approved', 'rejected', 'delete'].includes(status)) {
        return res.status(400).json({ error: `Request with status '${status}' cannot be modified.` });
    }

    next();
};
