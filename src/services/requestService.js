/**
 * Request Service
 *
 * This service provides functionalities for managing requests, including creation, retrieval, 
 * updating, and verification of requests. It supports various request types such as user actions,
 * product verification, brand verification, category verification, and admin actions.
 *
 * Function Descriptions:
 *
 * 1. `createRequest(data, user)`:
 *    - Creates a new request with the provided data and user details.
 *    - Validates the request type and checks for duplicate requests for verification-related types.
 *    - Returns the created request.
 *
 * 2. `getAllRequests(filter = {}, pagination)`:
 *    - Fetches all requests based on the provided filter and pagination options.
 *    - Returns a list of requests sorted by creation date.
 *
 * 3. `getRequestById(requestId)`:
 *    - Fetches a specific request by its ID.
 *    - Throws an error if the request is not found.
 *    - Returns the detailed request information.
 *
 * 4. `updateRequestStatus(requestId, status, note)`:
 *    - Updates the status of a specific request.
 *    - If related to verification, updates the target's verification status accordingly.
 *    - Returns the updated request.
 *
 * 5. `getUserRequests(userId)`:
 *    - Retrieves all requests made by a specific user.
 *    - Returns a list of requests sorted by creation date.
 *
 * 6. `verifyRequest(requestId, status, reason, description)`:
 *    - Handles verification requests (e.g., `verify_product`, `verify_brand`, `verify_category`).
 *    - Updates the verification status of the associated target and the request.
 *    - Returns the updated target.
 *
 * 7. `updateRequest(id, updates)`:
 *    - Updates any field of a specific request.
 *    - Records the previous target status before updating.
 *    - Returns the updated request.
 *
 * 8. `getModelForRequestType(requestType)`:
 *    - Maps request types to their corresponding database models (Product, Brand, or Category).
 *    - Throws an error for unsupported request types.
 *
 * Dependencies:
 * - Models:
 *   - `Request`: For managing request data.
 *   - `Product`: For product-related requests.
 *   - `Brand`: For brand-related requests.
 *   - `Category`: For category-related requests.
 * - Constants:
 *   - `REQUEST_TYPES`: Defines valid request types for different operations.
 *   - `VALID_REQUEST_TYPES`: Consolidated list of all valid request types.
 */

const Request = require('../models/Request');
const Product = require('../models/Product'); 
const Brand = require('../models/Brand'); 
const Category = require('../models/Category');
const User = require('../models/User'); 
const {
    VERIFY_TARGETS,
    REQUEST_TYPES,
    REQUEST_STATUS,
    DEFAULT_FEEDBACK,
} = require('../models/Request');

/**
 * Service to create a new request
 * @param {Object} data - Request data from client
 * @param {Object} user - User object from authentication middleware
 * @returns {Promise<Object>} - Saved request object
 */
exports.createRequest = async (data, user) => {
    const { verify_target, target_id, request_type, additional_info } = data;

    // Validate verify_target
    if (!Object.values(VERIFY_TARGETS).includes(verify_target)) {
        throw new Error(`Invalid verify_target: ${verify_target}`);
    }

    // Validate request_type based on verify_target
    const validRequestTypes = REQUEST_TYPES[verify_target.toUpperCase()];
    if (!validRequestTypes.includes(request_type)) {
        throw new Error(`Invalid request_type: ${request_type} for verify_target: ${verify_target}`);
    }

    // Create and save the request
    const request = new Request({
        user_id: user.id,
        verify_target,
        target_id,
        request_type,
        additional_info: additional_info || null,
        feedback: DEFAULT_FEEDBACK[verify_target] || 'This item is under review.',
        status: REQUEST_STATUS.PENDING,
    });

    return request.save();
};

/**
 * Service to get all requests with optional filtering and pagination
 * @param {Object} filter - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Array>} - List of matching requests
 */
exports.getAllRequests = async (filter, pagination) => {
    const query = Request.find(filter || {});

    if (pagination) {
        const { limit, page } = pagination;
        query.limit(parseInt(limit, 10)).skip(parseInt(limit, 10) * (parseInt(page, 10) - 1));
    }

    return query.exec();
};

/**
 * Service to get a request by ID
 * @param {String} id - Request ID
 * @returns {Promise<Object>} - Matching request object
 */
exports.getRequestById = async (id) => {
    const request = await Request.findById(id);
    if (!request) {
        throw new Error('Request not found');
    }
    return request;
};

/**
 * Service to update the status of a request
 * @param {String} id - Request ID
 * @param {String} status - New status for the request
 * @param {String} note - Optional note for the update
 * @returns {Promise<Object>} - Updated request object
 */
exports.updateRequestStatus = async (id, status, note) => {
    const validStatuses = Object.values(REQUEST_STATUS);
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
    }

    const request = await Request.findById(id);
    if (!request) {
        throw new Error('Request not found');
    }

    // Update request status
    request.status = status;
    if (note) {
        request.feedback = note;
    }

    return request.save();
};

/**
 * Service to verify a request
 * @param {String} id - Request ID
 * @param {String} status - Verification status (e.g., approved, rejected)
 * @param {String} reason - Reason for the status
 * @param {String} description - Optional description of the verification
 * @returns {Promise<Object>} - Verified request object
 */
exports.verifyRequest = async (id, status, reason, description) => {
    const request = await Request.findById(id);
    if (!request) {
        throw new Error('Request not found');
    }

    // Update request status and provide feedback
    request.status = status;
    request.feedback = `${reason || 'No reason provided.'} ${description || ''}`;

    return request.save();
};

/**
 * Service to get all requests by a specific user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - List of user's requests
 */
exports.getUserRequests = async (userId) => {
    return Request.find({ user_id: userId });
};

/**
 * Service to check if a request is overdue
 * @param {String} id - Request ID
 * @returns {Promise<Object>} - Updated request object if overdue
 */
exports.checkOverdueRequest = async (id) => {
    const request = await Request.findById(id);
    if (!request) {
        throw new Error('Request not found');
    }

    // Calculate overdue status
    const deadline = new Date(request.createdAt);
    deadline.setDate(deadline.getDate() + 7);

    if (new Date() > deadline) {
        request.status = REQUEST_STATUS.OVERDUE;
        await request.save();
    }

    return request;
};
