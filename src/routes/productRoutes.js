const express = require('express');
const productController = require('../controllers/productController');
const {verifyToken} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const { updateVerifyDescription } = require('../middleware/verifyMiddleware');

const router = express.Router();

// Routes for product CRUD
router.post('/', 
    verifyToken, 
    authorizeRole('seller'), 
    productController.createProduct);

router.get('/:id', productController.getProduct); // get product by id
router.get('/', productController.getAllProducts); // Everyone can view products
router.put('/:id', verifyToken, authorizeRole('seller'), productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('seller'), productController.deleteProduct);
//report the product
router.post('/report/:id', verifyToken, productController.reportProduct);
//Verify product-related routes
router.get('/status', verifyToken, authorizeRole('admin'), productController.getProductsByStatus);
router.patch(
    '/verify/:id',
    verifyToken,
    authorizeRole('admin'),
    updateVerifyDescription, // Middleware cập nhật description
    productController.updateProductVerify
);


module.exports = router;