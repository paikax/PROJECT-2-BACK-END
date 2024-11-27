const express = require("express");
const productController = require("../controllers/productController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const {filterByRole} = require("../middleware/filterMiddleware");
const {filterProduct} = require("../middleware/filterMiddleware");
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

// Create a Product
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
 *               descriptionFileUrl:
 *                 type: string
 *                 description: URL of the product description file
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               variants:
 *                 type: array
 *                 description: Product variants
 *                 items:
 *                   type: object
 *                   properties:
 *                     price:
 *                       type: number
 *                     stockQuantity:
 *                       type: number
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: array
 *                       items:
 *                         type: string
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               brandId:
 *                 type: string
 *                 description: Brand ID
 *               information:
 *                 type: object
 *                 description: Additional product information
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/products",
  verifyToken,
  authorizeRole("seller"),
  productController.createProduct
);

// Retrieve All Products with Verification and Filtering Options
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Filter products by verification status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: minRating
 *         description: Filter products by minimum rating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 */
router.get("/products", verifyToken, filterByRole, filterProduct, productController.getAllProducts);

// Retrieve a Product by ID
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
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", productController.getProduct);

// Update a Product by ID
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
 *               descriptionFileUrl:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               brandId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 description: Updated product rating (0-5)
 *     responses:
 *       200:
 *         description: Product updated successfully
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

// Delete a Product
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

// Report a Product
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

// Get Products by Verification Status
/**
 * @swagger
 * /products/status:
 *   get:
 *     summary: Get products by verification status
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Filter by verification status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Products filtered by status
 *       400:
 *         description: Bad request
 */
router.get(
  "/products/status",
  verifyToken,
  authorizeRole("admin"),
  productController.getProductsByStatus
);

// Update Product Verification Status
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
 *         description: ID of the product to verify
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
 *               reason:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 */
router.patch(
  "/products/verify/:id",
  verifyToken,
  authorizeRole("admin"),
  updateVerifyDescription,
  productController.updateProductVerify
);

module.exports = router;
