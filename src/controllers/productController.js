const productService = require("../services/productService");
const Request = require('../models/Request'); // Giả sử bạn có model Request
const Product = require('../models/Product');
const { createRequest } = require('../services/requestService');
// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      descriptionFileUrl,
      information,
      imageUrls,
      variants,
      attributes,
      categoryId,
      brandId,
    } = req.body;

    const product = await productService.createProduct({
      sellerId: req.user.id,
      name,
      price,
      descriptionFileUrl,
      information,
      imageUrls,
      variants,
      attributes,
      categoryId,
      brandId,
    });
// Tạo Request liên quan đến việc tạo sản phẩm
    await createRequest({
        action: 'add_product',
        targetId: newProduct._id,
        userId: req.user._id,
  });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
      // Sử dụng filterQuery được thiết lập bởi filterByRole và filterProduct middleware
      const query = req.filterQuery || {};
  
      // Lấy dữ liệu sản phẩm từ service
      const products = await productService.getAllProducts(query);
  
      // Trả về dữ liệu sản phẩm
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };
    const product = await productService.updateProduct(req.params.id, updates);
    await createRequest({
        action: 'change_product',
        targetId: product._id,
        userId: req.user._id,
      });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(403).json({ error: err.message }); // Use 403 Forbidden if the user is not authorized
  }
};

// Get Products by Status
exports.getProductsByStatus = async (req, res) => {
    try {
      const { status } = req.query;
      const products = await productService.getProductsByStatus(status);
      res.status(200).json(products);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  exports.updateProductStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "approved", "rejected"];
  
      // Kiểm tra giá trị trạng thái
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
  
      const updatedProduct = await productService.updateProductStatus(req.params.id, status);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      res.status(200).json({
        message: "Product status updated successfully",
        product: updatedProduct,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

// Report product
exports.reportProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const report = await productService.addProductReport(id, userId, reason);
    await createRequest({
        action: 'report_product',
        targetId: product._id,
        userId: req.user._id,
        additionalInfo: { reason },
      });
    res.status(200).json({ message: "Product reported successfully.", report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
