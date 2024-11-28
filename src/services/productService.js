const Product = require("../models/Product");
const ProductReport = require("../models/ProductReport"); // Import the new ProductReport model
const User = require("../models/User");

exports.createProduct = async ({
  sellerId,
  name,
  price,
  descriptionFileUrl,
  information,
  imageUrls,
  variants,
  attributes,
  categoryId,
  views = 0,
  brandId,
}) => {
  const product = new Product({
    sellerId,
    name,
    price,
    descriptionFileUrl,
    information,
    imageUrls,
    variants,
    attributes,
    categoryId,
    views,
    brandId,
  });

  await product.save();
  return product;
};

exports.getAllProducts = async (query, limit, skip) => {
    try {
      // Truy vấn với phân trang
      const products = await Product.find(query)
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "fullName") // Populate seller details
        .populate("categoryId", "name") // Populate category details
        .populate("brandId", "name"); // Populate brand details
  
      // Tính tổng số sản phẩm để hỗ trợ UI hiển thị phân trang
      const totalProducts = await Product.countDocuments(query);
  
      return {
        data: products,
        pagination: {
          total: totalProducts,
          limit,
          currentPage: Math.ceil(skip / limit) + 1,
          totalPages: Math.ceil(totalProducts / limit),
        },
      };
    } catch (err) {
      throw new Error("Failed to retrieve products");
    }
  };
  

// Get Product by ID
exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("sellerId", "fullName")
    .populate("categoryId", "name")
    .populate("brandId", "name"); // Populate brand details

  if (!product) {
    throw new Error("Product not found");
  }

  // Increment views count
  product.views = (product.views || 0) + 1;
  await product.save();
  return product;
};

// Update a Product
exports.updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  // Update all fields dynamically
  Object.assign(product, updates);

  // Update brandId explicitly if provided
  if (updates.brandId) {
    product.brandId = updates.brandId;
  }

  // Update variants if provided
  if (updates.variants) {
    product.variants = updates.variants.map((variant, index) => {
      const existingVariant = product.variants[index] || {};
      return { ...existingVariant, ...variant };
    });
  }

  await product.save();
  return product;
};

// Delete a Product
exports.deleteProduct = async (id, userId) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  // Verify if the user is the owner
  if (product.sellerId.toString() !== userId) {
    throw new Error("You are not authorized to delete this product");
  }

  await product.deleteOne();
};

// Get Products by Status
exports.getProductsByStatus = async (status) => {
    const query = status ? { status } : {};
    return await Product.find(query)
      .populate("sellerId", "fullName")
      .populate("categoryId", "name")
      .populate("brandId", "name");
  };
  
  exports.updateProductStatus = async (productId, status) => {
    // Kiểm tra xem sản phẩm có tồn tại hay không
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
  
    // Cập nhật trạng thái và thời gian chỉnh sửa
    product.status = status;
    product.updatedAt = new Date();
    
    // Lưu sản phẩm đã cập nhật
    const updatedProduct = await product.save();
  
    return updatedProduct; // Trả về document đã được cập nhật
  };
  
  

// Add Product Report
exports.addProductReport = async (productId, userId, reason) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  const existingReport = await ProductReport.findOne({
    product: productId,
    user: userId,
  });
  if (existingReport) {
    throw new Error("You have already reported this product.");
  }

  const report = new ProductReport({
    product: productId,
    user: userId,
    reason,
  });
  await report.save();

  // Increment seller's report flags
  const seller = await User.findById(product.sellerId);
  if (seller) {
    seller.reportFlags = (seller.reportFlags || 0) + 1;
    await seller.save();
  }

  return report;
};

// Delete Product Report by ID
exports.deleteReportById = async (reportId) => {
  const report = await ProductReport.findById(reportId).populate("product");
  if (!report) throw new Error("Report not found");

  const product = report.product;
  if (!product) throw new Error("Product not found for this report");

  // Decrement seller's report flags
  const seller = await User.findById(product.sellerId);
  if (seller) {
    seller.reportFlags = Math.max(0, (seller.reportFlags || 0) - 1);
    await seller.save();
  }

  await report.remove();
  return product;
};
