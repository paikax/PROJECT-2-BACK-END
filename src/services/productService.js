const Product = require('../models/Product');
const ProductReport = require('../models/ProductReport'); // Import the new ProductReport model
const User = require('../models/User');

exports.createProduct = async (name,description,price,imageUrls,variants,attributes,sellerId,categoryId,views = 0,brandId,information = null
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
    brand: brandId, // Map brandId to the brand field
    information,
  });
  await product.save();
  return product;
};

exports.getAllProducts = async (query) => {
  try {
    return await Product.find(query)
      .populate("seller", "fullName") // Populate seller details
      .populate("category", "name") // Populate category details
      .populate("brand", "name"); // Populate brand details
  } catch (err) {
    throw new Error("Failed to retrieve products");
  }
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('seller', 'fullName')
    .populate('category', 'name')
    .populate('brand', 'name'); // Populate brand name

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

  // Explicitly handle brandId update if provided
  if (updates.brandId) {
    product.brand = updates.brandId; // Map brandId to brand field
  }

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

exports.deleteProduct = async (id, userId) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check if the authenticated user is the owner of the product
  if (product.seller.toString() !== userId) {
    throw new Error('You are not authorized to delete this product');
  }

  // Use deleteOne() or findByIdAndDelete() to delete the product
  await Product.deleteOne({ _id: id });
};

// Verify product
exports.getProductsByStatus = async (status) => {
  const query = status ? { 'verify.status': status } : {};
  return await Product.find(query)
    .populate('seller', 'fullName')
    .populate('category', 'name')
    .populate('brand', 'name'); // Populate brand name
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