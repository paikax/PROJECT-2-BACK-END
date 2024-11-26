const requestService = require('../services/requestService');

// Tạo mới một request
exports.createRequest = async (req, res) => {
  try {
    const request = await requestService.createRequest(req.body, req.user);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả requests (admin)
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

// Lấy thông tin request theo ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await requestService.getRequestById(req.params.id);
    res.status(200).json(request);
  } catch (err) {
    res.status(404).json({ error: 'Request not found' });
  }
};

// Cập nhật trạng thái request
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

// Xác minh request (admin only)
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

// Lấy danh sách requests của user
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await requestService.getUserRequests(userId);
    res.status(200).json(requests);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user requests' });
  }
};
