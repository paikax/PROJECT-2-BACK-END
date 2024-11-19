const productService = require('../services/productService');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrls, variant, categoryId, views } = req.body;
    const product = await productService.createProduct(name, description, price, imageUrls, variant, req.user.id, categoryId ,views);
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
    const userId = req.user ? req.user.id : null; // Get user ID if logged in
    const product = await productService.getProductById(req.params.id, userId);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrls, variant, categoryId} = req.body;
    const product = await productService.updateProduct(req.params.id, { name, description, price, imageUrls, variant, category: categoryId });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};