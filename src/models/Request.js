const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  type: { type: String, enum: ['product', 'user'], required: true },  // Loại yêu cầu
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },  // ID của đối tượng (Product, User)
  title: {
    type: String,
    required: true, 
  },
  status: { 
    type: String, 
    enum: ['unread', 'pending', 'done'], 
    default: 'unread' 
  },  // Trạng thái yêu cầu
  result: { 
    type: String, 
    enum: ['approved', 'rejected', 'pending'], 
    default: 'pending' 
  },  // Kết quả của yêu cầu
  reason: { type: String,required: true },  // Lý do từ người gửi (ví dụ: lý do từ chối)
  feedback: { type: String },  // Phản hồi từ người quản trị (nếu có)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Người gửi yêu cầu
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Người xử lý yêu cầu
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
