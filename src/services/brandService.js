const Brand = require('../models/Brand');

// Create a brand
exports.createBrand = async (name, description, imageUrl) => {
  // Check if a brand with the same name exists
  const existingBrand = await Brand.findOne({ name });
  if (existingBrand) {
    throw new Error('Brand with this name already exists');
  }

  const brand = new Brand({ name, description, imageUrl });
  await brand.save();
  return brand;
};

// Get all brandes
exports.getAllBrands = async () => {
  return await Brand.find();
};

// Get a brand by ID
exports.getBrandById = async (id) => {
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new Error('Brand not found');
  }
  return brand;
};

// Update a brand
exports.updateBrand = async (id, updates) => {
  const brand = await Brand.findByIdAndUpdate(id, updates, { new: true });
  if (!brand) {
    throw new Error('Brand not found');
  }
  return brand;
};

// Delete a brand
exports.deleteBrand = async (id) => {
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    throw new Error('Brand not found');
  }
};

exports.updateVerifyStatus = async (id, updates) => {
    const target = await Brand.findById(id); // Thay `TargetModel` bằng `Product/Brand/Category`
    if (!target) throw new Error('Target not found');
    target.verify = updates.verify;
    await target.save();
  };
  