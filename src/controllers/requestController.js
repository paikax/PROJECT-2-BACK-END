const RequestService = require('../services/requestService');
const productService = require("../services/productService");
const userService = require('../services/userService');
const Product = require('../models/Product');  // Sửa đường dẫn phù hợp với dự án của bạn
const User = require('../models/User');

const mongoose = require('mongoose'); // Import mongoose for ObjectId

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

    // Check if the user already has a pending request for role upgrade (type: 'user')
    if (type === 'user') {
      const existingRequest = await RequestService.getAllRequests({
        type: 'user',
        createdBy: req.user.id,
        status: { $ne: 'done' }, // Only check for `unread` or `pending` requests
      });

      if (existingRequest.length > 0) {
        // Update the existing request instead of creating a new one
        const existingRequestId = existingRequest[0]._id;

        const updatedRequest = await RequestService.updateRequest(existingRequestId, {
          title,
          reason,
          updatedBy: req.user.id,
          updatedAt: new Date(),
        });

        return res.status(200).json({
          message: 'Existing request has been updated',
          request: updatedRequest,
        });
      }
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
      console.log(`[INFO] Bắt đầu lấy danh sách requests với bộ lọc từ query: ${JSON.stringify(req.query)}`);
      
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
  
      // Lấy danh sách requests
      const requests = await RequestService.getAllRequests(filter);
  
      console.log(`[INFO] Đã lấy được ${requests.length} requests. Bắt đầu xử lý thêm dữ liệu target.`);
  
      // Xử lý chi tiết target (user/product) và thêm `additionalData`
      const detailedRequests = await Promise.all(
        requests.map(async (request) => {
          const { type, targetId } = request;
  
          if (!type || !targetId) {
            console.warn(`[WARN] Request với ID: ${request._id} bị thiếu type hoặc targetId`);
            return { ...request.toObject(), additionalData: null }; // Đảm bảo có `additionalData`
          }
  
          try {
            let additionalData = null;
  
            // Lấy dữ liệu từ service tương ứng
            if (type === 'user') {
              console.log(`[INFO] Lấy thông tin user với ID: ${targetId}`);
              additionalData = await userService.getUserById(targetId);
            } else if (type === 'product') {
              console.log(`[INFO] Lấy thông tin product với ID: ${targetId}`);
              additionalData = await productService.getProductById(targetId);
            } else {
              console.warn(`[WARN] Request với ID: ${request._id} có type không hợp lệ: ${type}`);
            }
  
            return { ...request.toObject(), additionalData };
          } catch (error) {
            console.error(`[ERROR] Lỗi khi lấy dữ liệu target cho request ID: ${request._id}. Error: ${error.message}`);
            return { ...request.toObject(), additionalData: null }; // Trả về request gốc với `additionalData` là null
          }
        })
      );
  
      console.log(`[INFO] Hoàn tất xử lý requests. Trả dữ liệu cho frontend.`);
      res.status(200).json(detailedRequests);
    } catch (err) {
      console.error(`[ERROR] Lỗi xảy ra khi lấy danh sách requests: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  };
  
  
  

  exports.getRequestById = async (req, res) => {
    try {
      console.log(`[INFO] Bắt đầu xử lý request với ID: ${req.params.id}`);
  
      const { id } = req.params;
  
      // Lấy request từ cơ sở dữ liệu
      console.log(`[INFO] Lấy request từ cơ sở dữ liệu`);
      const request = await RequestService.getRequestById(id);
      if (!request) {
        console.error(`[ERROR] Không tìm thấy request với ID: ${id}`);
        return res.status(404).json({ error: 'Request not found' });
      }
  
      console.log(`[INFO] Đã tìm thấy request: ${JSON.stringify(request)}`);
  
      // Phân quyền: Chỉ admin hoặc người tạo mới có thể xem
      if (req.user.role !== 'admin' && request.createdBy.toString() !== req.user.id) {
        console.error(`[ERROR] Người dùng không có quyền truy cập request`);
        return res.status(403).json({ error: 'Access denied' });
      }
  
      // Lấy type và targetId từ request
      const { type, targetId } = request; // Giả sử request chứa field type và targetId
      if (!type || !targetId) {
        console.error(`[ERROR] type hoặc targetId bị thiếu trong request`);
        return res.status(400).json({ error: 'Type or Target ID is missing from the request' });
      }
  
      let additionalData = null;
  
      if (type === 'user') {
        console.log(`[INFO] Xử lý targetId là user với ID: ${targetId}`);
        const userExists = await User.findById(targetId);
        if (!userExists) {
          console.error(`[ERROR] Không tìm thấy user với ID: ${targetId}`);
          return res.status(404).json({ error: 'User not found' });
        }
  
        additionalData = await userService.getUserById(targetId);
        console.log(`[INFO] Đã lấy thông tin user: ${JSON.stringify(additionalData)}`);
      } else if (type === 'product') {
        console.log(`[INFO] Xử lý targetId là product với ID: ${targetId}`);
        const productExists = await Product.findById(targetId);
        if (!productExists) {
          console.error(`[ERROR] Không tìm thấy product với ID: ${targetId}`);
          return res.status(404).json({ error: 'Product not found' });
        }
  
        additionalData = await productService.getProductById(targetId);
        console.log(`[INFO] Đã lấy thông tin product: ${JSON.stringify(additionalData)}`);
      } else {
        console.error(`[ERROR] Loại type không hợp lệ: ${type}`);
        return res.status(400).json({ error: 'Invalid type' });
      }
  
      // Chuyển trạng thái từ unread sang pending nếu cần
      if (request.status === 'unread' && req.user.role === 'admin') {
        console.log(`[INFO] Đổi trạng thái request từ 'unread' sang 'pending'`);
        request.status = 'pending';
        await request.save();
      }
  
      // Trả dữ liệu cho frontend
      const responseData = {
        request,
        additionalData, // Dữ liệu thêm từ user hoặc product
      };
  
      console.log(`[INFO] Trả dữ liệu response: ${JSON.stringify(responseData)}`);
      res.status(200).json(responseData);
    } catch (err) {
      console.error(`[ERROR] Lỗi xảy ra trong quá trình xử lý: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  };
  
  

  exports.updateRequest = async (req, res) => {
    try {
      const { id } = req.params;
      const { result, feedback } = req.body;
  
      // Check if the request exists
      const request = await RequestService.getRequestById(id);
      if (!request) return res.status(404).json({ error: 'Request not found' });
  
      if (request.status === 'done') {
        return res.status(400).json({ error: 'Cannot update a request that is already marked as done' });
      }
      
      // Check if feedback is required
      if (result && result !== 'pending' && !feedback) {
        return res.status(400).json({ error: 'Feedback is required for approved or rejected requests' });
      }
  
      // Verify if the target ID exists in the corresponding collection
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
  
      // Update the product or user based on the request type
      const updates = { verify: { status: result, requestId: id, feedback: feedback } }; // Include feedback
      switch (request.type) {
        case 'product':
          await productService.updateVerifyStatus(request.targetId, updates);
          // Also update the product's feedback
          const product = await Product.findById(request.targetId);
          product.verify.feedback = feedback; // Store feedback in product
          await product.save();
          break;
        case 'user':
          await userService.updateRoleAndVerify(request.targetId, result, updates);
          break;
      }
  
      // Update the request
      request.result = result || request.result;
      request.feedback = feedback || request.feedback;
      request.updatedBy = req.user.id;
      request.status = 'done'; // Automatically mark as done
      const updatedRequest = await request.save();
  
      res.status(200).json(updatedRequest);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };

  exports.getRequestsByUser = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Validate and convert userId to ObjectId if needed
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
  
      const objectId = new mongoose.Types.ObjectId(userId);
  
      // Fetch all requests created by this user
      const requests = await RequestService.getAllRequests({ createdBy: objectId });
  
      res.status(200).json(requests);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

// API to approve a request
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the request by ID
    const request = await RequestService.getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify the request type is 'product'
    if (request.type !== 'product') {
      return res.status(400).json({ error: 'Only product requests can be approved via this API' });
    }

    // Verify if the target product exists
    const product = await Product.findById(request.targetId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found for the given request' });
    }

    // Update product's verify status to approved with feedback
    product.verify.status = 'approved';
    product.verify.requestId = request._id;
    product.verify.feedback = 'Product approved successfully';
    await product.save();

    // Update the request status and result
    request.status = 'done';
    request.result = 'approved';
    request.feedback = 'Product approved successfully';
    request.updatedBy = req.user.id;
    await request.save();

    res.status(200).json({
      message: 'Request approved successfully',
      request,
      product,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// API to reject a request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    // Ensure feedback is provided
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required to reject a request' });
    }

    // Find the request by ID
    const request = await RequestService.getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify the request type is 'product'
    if (request.type !== 'product') {
      return res.status(400).json({ error: 'Only product requests can be rejected via this API' });
    }

    // Verify if the target product exists
    const product = await Product.findById(request.targetId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found for the given request' });
    }

    // Update product's verify status to rejected with feedback
    product.verify.status = 'rejected';
    product.verify.requestId = request._id;
    product.verify.feedback = feedback;
    await product.save();

    // Update the request status and result
    request.status = 'done';
    request.result = 'rejected';
    request.feedback = feedback;
    request.updatedBy = req.user.id;
    await request.save();

    res.status(200).json({
      message: 'Request rejected successfully',
      request,
      product,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};