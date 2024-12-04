const RequestService = require('../services/requestService');
const ProductService = require('../services/productService');
const UserService = require('../services/userService');
const CategoryService = require('../services/categoryService');
const BrandService = require('../services/brandService');
const Product = require('../models/Product');  // Sửa đường dẫn phù hợp với dự án của bạn
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
//chua phan ro truong hop nao can role nao
exports.createRequest = async (req, res) => {
    try {
      const { type, targetId, title, reason } = req.body;
  
      // Kiểm tra `type` hợp lệ
      if (!['product', 'user', 'category', 'brand'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request type' });
      }
  
      // Xác minh `targetId` tồn tại trong collection tương ứng
      let targetExists;
      switch (type) {
        case 'product':
          targetExists = await Product.findById(targetId);
          break;
        case 'user':
          targetExists = req.user.id;
          break;
        case 'category':
          targetExists = await Category.findById(targetId);
          break;
        case 'brand':
          targetExists = await Brand.findById(targetId);
          break;
      }
  
      if (!targetExists) {
        return res.status(404).json({ error: `${type} not found with the given ID` });
      }
  
      // Tạo request mới
      const request = await RequestService.createRequest({
        type,
        targetId:req.user.id,
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
      console.log('Request found:', request);
      if (!request) return res.status(404).json({ error: 'Request not found' });

      // Không thể cập nhật nếu request đã "done"
      if (request.status === 'done') {
        return res.status(400).json({ error: 'Request is already completed' });
      }

      // Kiểm tra nếu `result` khác "pending", cần có `feedback`
      console.log('Result:', result, 'Feedback:', feedback);
      if (result && result !== 'pending' && !feedback) {
        return res.status(400).json({ error: 'Feedback is required for approved or rejected requests' });
      }

      // Cập nhật `target` dựa trên trạng thái
      const updates = { verify: { status: result, requestId: id } };
      console.log('Updates:', updates);
      switch (request.type) {
        case 'product':
          await ProductService.updateVerifyStatus(request.targetId, updates);
          break;
        case 'brand':
          await BrandService.updateVerifyStatus(request.targetId, updates);
          break;
        case 'category':
          await CategoryService.updateVerifyStatus(request.targetId, updates);
          break;
        case 'user':
          await UserService.updateRoleAndVerify(request.targetId, request.result, updates);
          break;
        default:
          throw new Error('Unsupported request type');
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
