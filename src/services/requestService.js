const Request = require('../models/Request');

exports.createRequest = async ({ type, targetId, title, reason, createdBy }) => {
  const request = await Request.create({
    type,
    targetId,
    targetModel: type == 'product' ? 'Product' : 'User',
    title,
    reason,
    createdBy,
  });
  return request; // Return the created request
};

  exports.getAllRequests = async (filter) => {
    return await Request.find(filter).populate('createdBy updatedBy targetId');
  };
  

  exports.getRequestById = async (id) => {
    return await Request.findById(id).populate('createdBy updatedBy targetId');
  };
  

  exports.updateRequest = async (id, updates) => {
    const request = await Request.findById(id);
    if (!request) throw new Error('Request not found');
  
    // Kiểm tra nếu `result` khác "pending", cần có `feedback`
    if (updates.result && updates.result !== 'pending' && !updates.feedback) {
      throw new Error('Feedback is required for approved or rejected requests');
    }
  
    // Cập nhật các trường
    Object.assign(request, updates, { status: 'done' }); // Trạng thái luôn là "done"
    return await request.save();
  };
  