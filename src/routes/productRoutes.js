const express = require("express");
const productController = require("../controllers/productController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const { updateVerifyDescription } = require("../middleware/verifyMiddleware");

const router = express.Router();

// Product CRUD routes
router.post('/', verifyToken, authorizeRole('seller'), productController.createProduct);
router.get('/:id', productController.getProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', verifyToken, authorizeRole('seller'), productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('seller'), productController.deleteProduct);

// Request and verify routes for Product
router.post('/request', verifyToken, requestController.createRequest);  // Create request for product
module.exports = router;
