const productService = require('../services/productService');
const User = require('../models/User');

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
// verify product
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

  exports.reportProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;
  
      const product = await productService.getProductById(id);
  
      // Check if the user has already reported this product
      if (product.reports.some(report => report.user.toString() === userId)) {
        return res.status(400).json({ error: 'You have already reported this product.' });
      }
  
      product.reports.push({ user: userId, reason });
  
      // Increment report flag for the seller
      const seller = await User.findById(product.seller);
      if (seller) {
        seller.reportFlags += 1;
        await seller.save();
      }
  
      await product.save();
  
      res.status(200).json({ message: 'Product reported successfully.' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  
  