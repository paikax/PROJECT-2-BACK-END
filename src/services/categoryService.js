const Category = require('../models/Category');
const Request = require('../models/Request');
const User = require('../models/User');

exports.createCategory = async (name, imageUrl) => {
  const category = new Category({ name, imageUrl });
  await category.save();
  return category;
};

exports.createCategoryRequest = async (requestData, user) => {
    const request = new Request({
      request_type: 'add_category', // Loại yêu cầu
      user_id: user._id,
      status: 'pending',
      additional_info: { name: requestData.name, imageUrl: requestData.imageUrl },
      created_at: new Date(),
    });
    return await request.save();
};

exports.getAllCategories = async () => {
  return await Category.find();
};

exports.getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

exports.updateCategory = async (id, updates) => {
  const category = await Category.findByIdAndUpdate(id, updates, { new: true });
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

exports.deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new Error('Category not found');
  }
};