const express = require('express');
const productController = require('../controllers/productController');
const {verifyToken} = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const { updateVerifyDescription } = require('../middleware/verifyMiddleware');

const router = express.Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product
 *     description: Create a new product. Only sellers can access this route.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sample Product
 *               description:
 *                 type: string
 *                 example: This is a sample product description.
 *               price:
 *                 type: number
 *                 example: 99.99
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg"]
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Variant 1
 *                     stockQuantity:
 *                       type: number
 *                       example: 10
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Color
 *                     value:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Red", "Blue"]
 *               seller:
 *                 type: string
 *                 example: 63f8d6f9b5e5b9e1bcd12345
 *               category:
 *                 type: string
 *                 example: 63f8d6f9b5e5b9e1bcd67890
 *               branch:
 *                 type: string
 *                 example: 63f8d6f9b5e5b9e1bcd54321
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  verifyToken,
  authorizeRole('seller'),
  productController.createProduct
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a product by its ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Product not found
 */
router.get('/:id', productController.getProduct);
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