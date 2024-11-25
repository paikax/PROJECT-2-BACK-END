const express = require("express");
const productController = require("../controllers/productController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const { updateVerifyDescription } = require("../middleware/verifyMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *                 description: Name of the product
 *                 example: Smartphone
 *               description:
 *                 type: string
 *                 description: Description of the product
 *                 example: A high-quality smartphone with advanced features
 *               price:
 *                 type: number
 *                 description: Price of the product
 *                 example: 999.99
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs for the product
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the variant
 *                       example: Color
 *                     stockQuantity:
 *                       type: number
 *                       description: Quantity in stock
 *                       example: 100
 *               attributes:
 *                 type: array
 *                 description: Array of attributes for the product
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the attribute
 *                       example: Size
 *                     value:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Values for the attribute
 *                       example: ["Small", "Medium", "Large"]
 *               categoryId:
 *                 type: string
 *                 description: ID of the category the product belongs to
 *                 example: 63cfb8a9e4b0e9a0f5a3e8d1
 *               brandId:
 *                 type: string
 *                 description: ID of the brand the product belongs to
 *                 example: 63cfb8a9e4b0e9a0f5a3e8d2
 *               information:
 *                 type: object
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 */
router.post(
  "/products",
  verifyToken,
  authorizeRole("seller"),
  productController.createProduct
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all verified products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of verified products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 */
router.get("/products", productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", productController.getProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the product
 *                 example: Updated Smartphone
 *               description:
 *                 type: string
 *                 description: Updated description of the product
 *                 example: Updated description
 *               price:
 *                 type: number
 *                 description: Updated price of the product
 *                 example: 1099.99
 *               categoryId:
 *                 type: string
 *                 description: Updated category ID
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.put(
  "/products/:id",
  verifyToken,
  authorizeRole("seller"),
  productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.delete(
  "/products/:id",
  verifyToken,
  authorizeRole("seller"),
  productController.deleteProduct
);

/**
 * @swagger
 * /report/products/{id}:
 *   post:
 *     summary: Report a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to report
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for reporting the product
 *                 example: "Inappropriate content"
 *     responses:
 *       200:
 *         description: Product reported successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/report/products/:id",
  verifyToken,
  productController.reportProduct
);

/**
 * @swagger
 * /products/status:
 *   get:
 *     summary: Get products by status
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filter products by verification status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: List of products filtered by status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 */
router.get(
  "/products/status",
  verifyToken,
  authorizeRole("admin"),
  productController.getProductsByStatus
);

/**
 * @swagger
 * /products/verify/{id}:
 *   patch:
 *     summary: Update product verification status
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to update verification for
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: Verification status
 *               reason:
 *                 type: string
 *                 description: Reason for status
 *               description:
 *                 type: string
 *                 description: A description for the verification status
 *     responses:
 *       200:
 *         description: Product verification status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.patch(
  "/products/verify/:id",
  verifyToken,
  authorizeRole("admin"),
  updateVerifyDescription, // Middleware cập nhật description
  productController.updateProductVerify
);

module.exports = router;
