const Branch = require('../models/Branch'); // Import Branch model
const Request = require('../models/Request'); // Model Request
const User = require('../models/User'); // Model User (nếu cần liên kết người dùng)
// Create Branch
exports.createBranch = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    // Create a new branch
    const branch = new Branch({
      name,
      description,
      imageUrl,
    });

    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Branches
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json(branches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Single Branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.status(200).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Branch
exports.updateBranch = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Update the branch details
    branch.name = name || branch.name;
    branch.description = description || branch.description;
    branch.imageUrl = imageUrl || branch.imageUrl;

    await branch.save();
    res.status(200).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Branch
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    await branch.deleteOne();
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Tạo yêu cầu (request) cho nhánh
exports.createBranchRequest = async (req, res) => {
    try {
      const { branchId, requestType, description } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!branchId || !requestType || !description) {
        return res.status(400).json({ error: 'All fields (branchId, requestType, description) are required.' });
      }
  
      const userId = req.user._id; // Giả sử thông tin người dùng đã có trong req.user
  
      // Tạo yêu cầu mới
      const request = new Request({
        user_id: userId,
        request_type: requestType,
        description: description,
        status: 'pending',
        branch_id: branchId,
      });
  
      await request.save();
      res.status(201).json({ message: 'Request created successfully', request });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  // Xác minh yêu cầu cho nhánh (verify)
  exports.verifyBranchRequest = async (req, res) => {
    try {
      const { requestId, status, note } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!requestId || !status) {
        return res.status(400).json({ error: 'Request ID and status are required.' });
      }
  
      const request = await Request.findById(requestId).populate('user_id');
  
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
  
      // Kiểm tra xem yêu cầu có ở trạng thái 'pending' không
      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Cannot verify a completed request' });
      }
  
      // Cập nhật trạng thái yêu cầu
      request.status = status; // Cập nhật trạng thái (approved, rejected, v.v.)
      request.notes = note || '';
      await request.save();
  
      res.status(200).json({ message: 'Request verified successfully', request });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };