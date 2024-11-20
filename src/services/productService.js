const Product = require('../models/Product');

exports.createProduct = async (name, description, price, imageUrls, variants, attributes, sellerId, categoryId, views = 0) => {
  const product = new Product({
    name,
    description,
    price,
    imageUrls,
    variants,    // Keep variants as is
    attributes,  // Add attributes here
    seller: sellerId,
    category: categoryId,
    views,
  });
  await product.save();
  return product;
};

exports.getAllProducts = async () => {
  return await Product.find().populate('seller', 'fullName').populate('category', 'name');
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('seller', 'fullName')
    .populate('category', 'name');

  if (!product) {
    throw new Error('Product not found');
  }

  // Increment views every time this product is accessed
  product.views += 1; // Increment views
  await product.save(); // Save the updated product with the new views count
  return product;
};

exports.updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  Object.assign(product, updates);
  await product.save();
  return product;
};

exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);
  await product.remove();
};

//verify product
exports.getProductsByStatus = async (status) => {
    const query = status ? { 'verify.status': status } : {};
    return await Product.find(query).populate('seller category');
  };
  
  exports.updateProductVerify = async (id, status, reason, description) => {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
  
    product.verify.status = status;
    product.verify.reason = reason;
    product.verify.description = description; // Sử dụng description từ middleware
    await product.save();
  
    return product;
  };
