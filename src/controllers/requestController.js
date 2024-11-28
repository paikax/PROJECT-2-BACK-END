/**
 * Request Controller Functions
 *
 * This file defines controller methods for handling HTTP requests related to verification targets.
 *
 * Controller Methods Overview:
 *
 * 1. `createRequest`: Handles the creation of a new request.
 *    - Accepts request data and user information.
 *    - Responds with the newly created request or an error message.
 *
 * 2. `getAllRequests`: Retrieves all requests (admin only).
 *    - Supports filtering and pagination via query parameters.
 *    - Responds with the list of matching requests or an error message.
 *
 * 3. `getRequestById`: Fetches a request by its ID.
 *    - Responds with the request data or an error if the request is not found.
 *
 * 4. `updateRequestStatus`: Updates the status of a request.
 *    - Accepts `status` and `note` in the request body.
 *    - Responds with the updated request or an error message.
 *
 * 5. `verifyRequest`: Verifies a request (admin only).
 *    - Accepts `status`, `reason`, and `description` in the request body.
 *    - Responds with verification success or an error message.
 *
 * 6. `getUserRequests`: Retrieves requests created by the currently logged-in user.
 *    - Responds with the list of requests or an error message.
 *
 * Dependencies:
 * - `requestService`: Provides the business logic for handling requests.
 */

const requestService = require('../services/requestService');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const request = await requestService.createRequest(req.body, req.user);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all requests (admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { filter, pagination } = req.query;

    const requests = await requestService.getAllRequests(
      filter ? JSON.parse(filter) : {},
      pagination ? JSON.parse(pagination) : null
    );
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// Get request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await requestService.getRequestById(req.params.id);
    res.status(200).json(request);
  } catch (err) {
    res.status(404).json({ error: 'Request not found' });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const updatedRequest = await requestService.updateRequestStatus(id, status, note);
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Verify request (admin only)
exports.verifyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, description } = req.body;

    const verifiedTarget = await requestService.verifyRequest(id, status, reason, description);
    res.status(200).json({ message: 'Request verified successfully', verifiedTarget });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user requests
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await requestService.getUserRequests(userId);
    res.status(200).json(requests);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user requests' });
  }
};

exports.getAllRequestsWithFilter = async (req, res) => {
    try {
        const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
        const pagination = {
            limit: req.query.limit || 10,
            page: req.query.page || 1,
        };
        const requests = await requestService.getAllRequests(filter, pagination);
        res.status(200).json(requests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};