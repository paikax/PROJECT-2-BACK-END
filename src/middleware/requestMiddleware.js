/**
 * Request Middleware Functions
 * 
 * This file contains middleware for handling requests related to verification targets in the application.
 * 
 * Middleware Overview:
 * 
 * 1. `validateRequestAccess`: Checks if the user has access to the specified request.
 *    - Admins can access all requests.
 *    - Regular users can only access their own requests.
 * 
 * 2. `validateRequestType`: Validates if the `request_type` provided in the request body is valid.
 * 
 * 3. `updateTargetStatus`: Updates the status of a target and provides feedback.
 *    - Checks if `target_status`, `verify_target`, and `target_id` are valid.
 * 
 * 4. `autoCreateRequest`: Automatically creates a request for admin actions.
 *    - Ensures all required fields are present and saves the request to the database.
 * 
 * 5. `checkRequestStatus`: Prevents modification of requests with specific statuses (e.g., approved, rejected, delete).
 * 
 * Constants Imported:
 * - `VERIFY_TARGETS`: Types of verification targets (e.g., user, product).
 * - `REQUEST_TYPES`: Valid request types for each target.
 * - `TARGET_STATUS`: Status values for targets.
 * - `REQUEST_STATUS`: Status values for requests.
 * - `DEFAULT_FEEDBACK`: Default feedback messages for targets.
 */

const Request = require('../models/Request');
const {
    VERIFY_TARGETS,
    REQUEST_TYPES,
    TARGET_STATUS,
    REQUEST_STATUS,
    DEFAULT_FEEDBACK,
} = require('../models/Request');

// Middleware: Validate request access
exports.validateRequestAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Admins have access to all requests
        if (req.user.role === 'admin') {
            req.request = request;
            return next();
        }

        // Verify request ownership
        if (request.user_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        req.request = request;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware: Validate request type
exports.validateRequestType = (req, res, next) => {
    const requestType = req.body.request_type;

    const isValid = Object.values(REQUEST_TYPES).some((types) => types.includes(requestType));
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid request type' });
    }

    next();
};

// Middleware: Update target status
exports.updateTargetStatus = async (req, res, next) => {
    try {
        const { target_status, reason, verify_target, target_id } = req.body;

        // Validate `target_status`
        if (!Object.values(TARGET_STATUS).includes(target_status)) {
            return res.status(400).json({ error: 'Invalid target_status value' });
        }

        if (!VERIFY_TARGETS[verify_target.toUpperCase()] || !target_id) {
            return res.status(400).json({ error: 'Missing or invalid verify_target or target_id' });
        }

        // Create feedback based on status
        req.body.feedback = `${verify_target} has been updated to '${target_status}' successfully.`;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware: Automatically create a request (admin action)
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

        // Save to the database
        const Request = require('../models/Request');
        await new Request(newRequest).save();

        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware: Check request status
exports.checkRequestStatus = (req, res, next) => {
    const { status } = req.body;

    if (status && ['approved', 'rejected', 'delete'].includes(status)) {
        return res.status(400).json({ error: `Request with status '${status}' cannot be modified.` });
    }

    next();
};

exports.checkOverdueRequest = async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await Request.findById(id);
  
      if (!request) return res.status(404).json({ error: 'Request not found' });
  
      // Kiểm tra quá hạn
      const deadline = new Date(request.createdAt);
      deadline.setDate(deadline.getDate() + 7);
  
      if (new Date() > deadline) {
        request.status = 'overdue';
        request.overdue = true;
        await request.save();
      }
  
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };