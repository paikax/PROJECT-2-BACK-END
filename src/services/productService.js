const Product = require('../models/Product');
const User = require('../models/User'); // Ensure User is imported
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

  //report a product
  exports.addProductReport = async (productId, userId, reason) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
  
    if (product.reports.some(report => report.user.toString() === userId)) {
      throw new Error('You have already reported this product.');
    }
  
    product.reports.push({ user: userId, reason });
    await product.save();
  
    return product;
  };

// delete report by id
exports.deleteReportById = async (reportId) => {
  const product = await Product.findOne({ "reports._id": reportId });
  if (!product) throw new Error('Report not found');

  // Find the report to be deleted
  const reportToDelete = product.reports.id(reportId);
  if (!reportToDelete) throw new Error('Report not found');

  // Get the user who reported the product
  const userId = reportToDelete.user;

  // Remove the report from the product's reports
  product.reports = product.reports.filter(report => report._id.toString() !== reportId);
  
  // Decrement the report flag for the seller
  const seller = await User.findById(product.seller);
  if (seller) {
    seller.reportFlags = Math.max(0, seller.reportFlags - 1); // Ensure it doesn't go below 0
    await seller.save();
  }

  await product.save();
  
  return product;
};