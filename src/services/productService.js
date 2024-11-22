const Product = require('../models/Product');
const ProductReport = require('../models/ProductReport'); // Import the new ProductReport model
const User = require('../models/User');

exports.createProduct = async (name,description,price,imageUrls,variants,attributes,sellerId,categoryId,views = 0,branch = null,information = null // Include information as an object
) => {
  const product = new Product({
    name,
    description,
    price,
    imageUrls,
    variants,
    attributes,
    seller: sellerId,
    category: categoryId,
    views,
    branch,
    information, // Pass the information object here
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
  product.views += 1;
  await product.save();
  return product;
};

exports.updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  // Update each field
  Object.assign(product, updates);
  // Update additionalData for variants if provided
  if (updates.variants) {
    product.variants = updates.variants.map((variant, index) => {
      const existingVariant = product.variants[index] || {};
      return { ...existingVariant, ...variant };
    });
  }

  await product.save();
  return product;
};

exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);
  await product.remove();
};

// Verify product
exports.getProductsByStatus = async (status) => {
  const query = status ? { 'verify.status': status } : {};
  return await Product.find(query).populate('seller category');
};

exports.updateProductVerify = async (id, status, reason, description) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');

  product.verify.status = status;
  product.verify.reason = reason;
  product.verify.description = description;
  await product.save();

  return product;
};

// Report a product
exports.addProductReport = async (productId, userId, reason) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const existingReport = await ProductReport.findOne({ product: productId, user: userId });
  if (existingReport) {
    throw new Error('You have already reported this product.');
  }

  const report = new ProductReport({ product: productId, user: userId, reason });
  await report.save();

  // Increment report flag for the seller
  const seller = await User.findById(product.seller);
  if (seller) {
    seller.reportFlags += 1;
    await seller.save();
  }

  return report;
};

// Delete report by ID
exports.deleteReportById = async (reportId) => {
  const report = await ProductReport.findById(reportId).populate('product');
  if (!report) throw new Error('Report not found');

  const product = report.product;
  if (!product) throw new Error('Product not found for this report');

  // Decrement the report flag for the seller
  const seller = await User.findById(product.seller);
  if (seller) {
    seller.reportFlags = Math.max(0, seller.reportFlags - 1);
    await seller.save();
  }

  await report.remove();
  return product;
};