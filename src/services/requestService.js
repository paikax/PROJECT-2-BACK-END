const Request = require('../models/Request');
const Product = require('../models/Product'); 
const Brand = require('../models/Brand'); 
const Category = require('../models/Category'); 

const VALID_REQUEST_TYPES = [
  ...REQUEST_TYPES.USER,
  ...REQUEST_TYPES.PRODUCT,
  ...REQUEST_TYPES.BRAND,
  ...REQUEST_TYPES.CATEGORY,
  ...REQUEST_TYPES.ADMIN,
];

// Tạo một request mới
exports.createRequest = async (data, user) => {
  if (!VALID_REQUEST_TYPES.includes(data.request_type)) {
    throw new Error('Invalid request type');
  }

  const request = new Request({
    ...data,
    user_id: user._id,
    status: 'pending',
    created_at: new Date(),
  });

  // Kiểm tra yêu cầu trùng lặp (ví dụ: `verify_product`)
  if (['verify_product', 'verify_brand', 'verify_category'].includes(data.request_type)) {
    const existingRequest = await Request.findOne({
      request_type: data.request_type,
      'additional_info.targetId': data.additional_info.targetId,
    });
    if (existingRequest) {
      throw new Error(`A verification request already exists for this ${data.request_type}`);
    }
  }

  return await request.save();
};

// Lấy tất cả requests (admin)
exports.getAllRequests = async (filter = {}, pagination) => {
  const query = Request.find(filter).populate('user_id', 'fullName');
  if (pagination) {
    query.skip(pagination.skip).limit(pagination.limit);
  }
  return await query.sort('-created_at');
};

// Lấy request cụ thể theo ID
exports.getRequestById = async (requestId) => {
  const request = await Request.findById(requestId).populate('user_id');
  if (!request) {
    throw new Error('Request not found');
  }
  return request;
};

// Cập nhật trạng thái request
exports.updateRequestStatus = async (requestId, status, note) => {
  const request = await Request.findById(requestId);
  if (!request) throw new Error('Request not found');
  if (request.status !== 'pending') throw new Error('Cannot update a completed request');

  request.status = status;
  if (note) request.notes = note;
  request.updated_at = new Date();

  // Nếu request liên quan đến xác minh
  if (['verify_product', 'verify_brand', 'verify_category'].includes(request.request_type)) {
    const targetModel = getModelForRequestType(request.request_type);
    const target = await targetModel.findById(request.additional_info.targetId);
    if (!target) throw new Error('Target not found');

    if (status === 'approved') {
      target.verify.status = 'verified';
    } else if (status === 'rejected') {
      target.verify.status = 'rejected';
    }
    await target.save();
  }

  return await request.save();
};

// Lấy các request của user
exports.getUserRequests = async (userId) => {
  return await Request.find({ user_id: userId }).sort('-created_at');
};

// Xác minh request (chuyên dụng cho `verify_*` types)
exports.verifyRequest = async (requestId, status, reason, description) => {
  const request = await Request.findById(requestId);
  if (!request) throw new Error('Request not found');
  if (!['verify_product', 'verify_brand', 'verify_category'].includes(request.request_type)) {
    throw new Error('Invalid request type for verification');
  }

  const targetModel = getModelForRequestType(request.request_type);
  const target = await targetModel.findById(request.additional_info.targetId);
  if (!target) throw new Error('Target not found');

  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Invalid status');
  }

  target.verify = { status, reason, description };
  await target.save();

  // Cập nhật trạng thái request
  request.status = status;
  await request.save();

  return target;
};

// Cập nhật một request bất kỳ
exports.updateRequest = async (id, updates) => {
  const request = await Request.findById(id);
  if (!request) throw new Error('Request not found');

  updates.previous_target_status = request.target_status;
  Object.assign(request, updates);
  return await request.save();
};

// Lấy model tương ứng với `request_type`
const getModelForRequestType = (requestType) => {
  switch (requestType) {
    case 'verify_product':
      return Product;
    case 'verify_brand':
      return Brand;
    case 'verify_category':
      return Category;
    default:
      throw new Error('Unsupported request type');
  }
};
