const express = require('express');
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const { updateVerifyDescription } = require('../middleware/verifyMiddleware');

const router = express.Router();

// Routes for product CRUD
router.post('/products', 
    verifyToken, 
    authorizeRole('seller'), 
    productController.createProduct);

router.get('/products/:id', productController.getProduct); // get product by id
router.get('/products', productController.getAllProducts); // Everyone can view products
router.put('/products/:id', verifyToken, authorizeRole('seller'), productController.updateProduct);
router.delete('/products/:id', verifyToken, authorizeRole('seller'), productController.deleteProduct);

//Verify product-related routes
router.get('/products/status', verifyToken, authorizeRole('admin'), productController.getProductsByStatus);
router.patch(
    '/products/:id/verify',
    verifyToken,
    authorizeRole('admin'),
    updateVerifyDescription, // Middleware cập nhật description
    productController.updateProductVerify
);


module.exports = router;