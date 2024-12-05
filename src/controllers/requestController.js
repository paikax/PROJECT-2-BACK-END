const RequestService = require('../services/requestService');
const ProductService = require('../services/productService');
const UserService = require('../services/userService');
const Product = require('../models/Product');  // Sửa đường dẫn phù hợp với dự án của bạn
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
      const { type, targetId, title, reason } = req.body;

      // Check if `type` is valid
      if (!['product', 'user'].includes(type)) {
          return res.status(400).json({ error: 'Invalid request type' });
      }

      // Restrict users with role `user` from creating product requests
      if (type === 'product' && req.user.role === 'user') {
          return res.status(403).json({ error: 'You are not authorized to request a product' });
      }

      // Verify `targetId` exists in the corresponding collection
      let targetExists;
      switch (type) {
          case 'product':
              targetExists = await Product.findById(targetId);
              break;
          case 'user':
              targetExists = await User.findById(targetId);
              break;
      }
      if (!targetExists) {
          return res.status(404).json({ error: `${type} not found with the given ID` });
      }

      // Create a new request
      const request = await RequestService.createRequest({
          type,
          targetId,
          title,
          reason,
          createdBy: req.user.id,
      });
      res.status(201).json(request);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
};

  exports.getAllRequests = async (req, res) => {
    try {
      const { type, status, keyword, startDate, endDate } = req.query;
      let filter = {};
  
      // Áp dụng bộ lọc
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (keyword) filter.title = { $regex: keyword, $options: 'i' };
      if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
  
      // Phân quyền
      if (req.user.role !== 'admin') {
        filter.createdBy = req.user.id; // User chỉ xem request của chính mình
      }
  
      const requests = await RequestService.getAllRequests(filter);
      res.status(200).json(requests);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  

  exports.getRequestById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const request = await RequestService.getRequestById(id);
      if (!request) return res.status(404).json({ error: 'Request not found' });
  
      // Phân quyền: Chỉ admin hoặc người tạo mới có thể xem
      if (req.user.role !== 'admin' && request.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
  
      // Chuyển trạng thái từ unread sang pending
      if (request.status === 'unread' && req.user.role == 'admin') {
        request.status = 'pending';
        await request.save();
      }
  
      res.status(200).json(request);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { result, feedback } = req.body;

        // Kiểm tra request tồn tại
        const request = await RequestService.getRequestById(id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Không thể cập nhật nếu request đã "done"
        if (request.status === 'done') {
            return res.status(400).json({ error: 'Request is already completed' });
        }

        // Kiểm tra nếu `result` khác "pending", cần có `feedback`
        if (result && result !== 'pending' && !feedback) {
            return res.status(400).json({ error: 'Feedback is required for approved or rejected requests' });
        }

        // Kiểm tra `targetId` tồn tại trong collection tương ứng
        let targetExists;
        switch (request.type) {
            case 'product':
                targetExists = await Product.findById(request.targetId);
                break;
            case 'user':
                targetExists = await User.findById(request.targetId);
                break;
            default:
                return res.status(400).json({ error: 'Unsupported request type' });
        }

        if (!targetExists) {
            return res.status(404).json({ error: `${request.type} not found with the given ID` });
        }

        // Cập nhật `target` dựa trên trạng thái
        const updates = { verify: { status: result, requestId: id } };
        switch (request.type) {
            case 'product':
                await ProductService.updateVerifyStatus(request.targetId, updates);
                break;
            case 'user':
                await UserService.updateRoleAndVerify(request.targetId, result, updates);
                break;
        }

        // Cập nhật request
        request.result = result || request.result;
        request.feedback = feedback || request.feedback;
        request.updatedBy = req.user.id;
        request.status = 'done'; // Tự động chuyển trạng thái thành "done"
        const updatedRequest = await request.save();

        res.status(200).json(updatedRequest);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};
