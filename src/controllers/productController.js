const productService = require('../services/productService');
const ProductReport = require('../models/ProductReport'); // Import ProductReport model
const User = require('../models/User');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrls, variants, attributes, views, branch, information } = req.body;
    const product = await productService.createProduct(
      name,
      description,
      price,
      imageUrls,
      variants,
      attributes,
      req.user.id,
      req.body.categoryId,
      views,
      branch,
      information
    );
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrls, variants, attributes, categoryId } = req.body;
    const product = await productService.updateProduct(req.params.id, { name, description, price, imageUrls, variants, attributes, category: categoryId });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(403).json({ error: err.message }); // Use 403 Forbidden if the user is not authorized
  }
};

// Verify product
exports.getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const products = await productService.getProductsByStatus(status);
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProductVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, description } = req.body;

    const product = await productService.updateProductVerify(id, status, reason, description);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Report product
exports.reportProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const report = await productService.addProductReport(id, userId, reason);

    res.status(200).json({ message: 'Product reported successfully.', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};