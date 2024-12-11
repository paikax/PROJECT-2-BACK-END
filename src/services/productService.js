const Product = require("../models/Product");
const ProductReport = require("../models/ProductReport");
const User = require("../models/User");
const RequestService = require("../services/requestService");

exports.createProduct = async ({
  sellerId,
  name,
  price,
  description,
  imageUrls,
  variants,
  categoryId,
  brandId,
}) => {
  console.log("Received product details:", {
    sellerId,
    name,
    price,
    description,
    imageUrls,
    variants,
    categoryId,
    brandId,
  });

  // Validate variant prices
  variants.forEach((variant, index) => {
    const variantPrice = variant.price;
    if (isNaN(variantPrice) || variantPrice < 0) {
      throw new Error(
        `Invalid variant price at index ${index}: ${variantPrice}`
      );
    }
  });

  // Create the product object
  const product = new Product({
    sellerId,
    name,
    originalPrice: price,
    price: price,
    description,
    imageUrls,
    variants: variants.map((variant) => ({
      originalPrice: variant.price,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      attributes: variant.attributes,
    })),
    categoryId,
    brandId,
  });

  await product.save();

  // Create a request for the new product
  const request = await RequestService.createRequest({
    type: "product",
    targetId: product._id,
    title: `Request for new product: ${name}`,
    reason: `A new product has been created by seller ${sellerId}.`,
    createdBy: sellerId,
  });

  // Update the product with the requestId
  product.verify.requestId = request._id;
  await product.save();

  return product;
};
exports.loadProductsByScroll = async (filters, skip, limit) => {
  const query = buildQuery(filters);

  // Retrieve paginated products
  return await Product.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); // Sort by newest products
};

exports.countFilteredProducts = async (filters) => {
  const query = buildQuery(filters);

  // Count documents matching the query
  return await Product.countDocuments(query);
};

// Utility function to build query
function buildQuery(filters) {
  const query = {};

  // Apply verification filter
  query["verify.status"] = filters.verificationStatus || "approved";

  // Apply category filters
  if (filters.categories && filters.categories.length) {
    query.categoryId = { $in: filters.categories };
  }

  // Apply brand filters
  if (filters.brands && filters.brands.length) {
    query.brandId = { $in: filters.brands };
  }

  // Apply price range filter
  if (filters.price) {
    const [minPrice, maxPrice] = filters.price;
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  return query;
}

exports.getAllProducts = async (query) => {
  try {
    return await Product.find(query)
      .populate("sellerId", "fullName")
      .populate("categoryId", "name")
      .populate("brandId", "name");
  } catch (err) {
    throw new Error("Failed to retrieve products");
  }
};

// Get Products by Seller ID
exports.getProductsBySellerId = async (sellerId) => {
  try {
    const products = await Product.find({ sellerId })
      .populate("categoryId", "name")
      .populate("brandId", "name");
    return products;
  } catch (err) {
    throw new Error("Failed to retrieve products for the seller");
  }
};

// Get Product by ID
exports.getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("sellerId", "fullName")
    .populate("categoryId", "name")
    .populate("brandId", "name");

  if (!product) {
    throw new Error("Product not found");
  }

  // Increment views count
  product.views = (product.views || 0) + 1;
  await product.save();
  return product;
};

// Update a Product
// Update a Product
exports.updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  Object.assign(product, updates);

  // Update variants and handle their changes
  if (updates.variants) {
    product.variants = updates.variants.map((variant, index) => {
      const existingVariant = product.variants[index] || {};
      return { ...existingVariant, ...variant };
    });
  }

  // Validate and update price fields if necessary
  if (updates.price) {
    const price = parseFloat(updates.price);
    if (isNaN(price) || price < 0) {
      throw new Error("Invalid product price");
    }
    product.price = price;
  }

  // Validate and update original price if necessary
  if (updates.originalPrice) {
    const originalPrice = parseFloat(updates.originalPrice);
    if (isNaN(originalPrice) || originalPrice < 0) {
      throw new Error("Invalid original price");
    }
    product.originalPrice = originalPrice;
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

  if (product.sellerId.toString() !== userId) {
    throw new Error("You are not authorized to delete this product");
  }

  await product.deleteOne();
};

// Get Products by Verification Status
exports.getProductsByStatus = async (status) => {
  const query = status ? { "verify.status": status } : {};
  return await Product.find(query)
    .populate("sellerId", "fullName")
    .populate("categoryId", "name")
    .populate("brandId", "name");
};

// Update Product Verification
exports.updateProductVerify = async (id, { status, reason, description }) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  product.verify.status = status;
  product.verify.reason = reason || product.verify.reason;
  product.verify.description = description || product.verify.description;

  await product.save();
  return product;
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

  const seller = await User.findById(product.sellerId);
  if (seller) {
    seller.reportFlags = Math.max(0, (seller.reportFlags || 0) - 1);
    await seller.save();
  }

  await report.remove();
  return product;
};

exports.updateVerifyStatus = async (id, updates) => {
  const target = await Product.findById(id); // Thay `TargetModel` bằng `Product/Brand/Category`
  if (!target) throw new Error("Target not found");
  target.verify = updates.verify;
  await target.save();
};

exports.getVariantDetails = async (variantId) => {
  try {
    // Find the product where the variant ID exists
    const product = await Product.findOne({ "variants._id": variantId });

    if (!product) {
      throw new Error("Product not found");
    }

    // Find the variant within the product by its variantId
    const variant = product.variants.id(variantId);

    if (!variant) {
      throw new Error("Variant not found");
    }

    return variant;
  } catch (error) {
    throw new Error(error.message);
  }
};
