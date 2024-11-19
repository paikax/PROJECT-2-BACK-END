const productService = require('../services/productService');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrls, variants, attributes, views } = req.body;
    const product = await productService.createProduct(name, description, price, imageUrls, variants, attributes, req.user.id, req.body.categoryId, views);
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
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};