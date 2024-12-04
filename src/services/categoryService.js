const Category = require('../models/Category');

exports.createCategory = async (name, imageUrl) => {
  const category = new Category({ name, imageUrl });
  await category.save();
  return category;
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

exports.updateVerifyStatus = async (id, updates) => {
    const target = await Category.findById(id); // Thay `TargetModel` bằng `Product/Brand/Category`
    if (!target) throw new Error('Target not found');
    target.verify = updates.verify;
    await target.save();
  };