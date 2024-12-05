const express = require("express");
const productController = require("../controllers/productController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const { updateVerifyDescription } = require("../middleware/verifyMiddleware");
const reviewController = require("../controllers/reviewController");

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
 *             required:
 *               - name
 *               - description
 *               - price
 *               - imageUrls
 *               - categoryId
 *               - brandId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Description of the product
 *               price:
 *                 type: number
 *                 description: Price of the product
 *                 example: 199.99
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
 *                       description: Price of the variant
 *                     stockQuantity:
 *                       type: number
 *                       description: Stock quantity of the variant
 *                     attributes:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       description: Dynamic object for variant attributes (e.g., ram, color)
 *               categoryId:
 *                 type: string
 *                 description: ID of the category the product belongs to
 *               brandId:
 *                 type: string
 *                 description: ID of the brand the product belongs to
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
router.get("/products", verifyToken, productController.getAllProducts);

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
 *               description:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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

// Get Products by Seller ID
/**
 * @swagger
 * /products/seller/{sellerId}:
 *   get:
 *     summary: Get products by seller ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         description: ID of the seller whose products to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
  "/products/seller/:sellerId",
  verifyToken,
  productController.getProductsBySellerId
);

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API for managing product reviews
 */

// Create a Review
/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review for a product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to review
 *               rating:
 *                 type: number
 *                 description: Rating for the product (1-5)
 *               comment:
 *                 type: string
 *                 description: Review comment
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: User must purchase the product before reviewing
 */
router.post("/reviews", verifyToken, reviewController.createReview);

// Get Reviews for a Product
/**
 * @swagger
 * /reviews/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to retrieve reviews for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: ID of the user who wrote the review
 *                   productId:
 *                     type: string
 *                     description: ID of the reviewed product
 *                   rating:
 *                     type: number
 *                     description: Rating given by the user
 *                   comment:
 *                     type: string
 *                     description: Review comment
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Bad request
 */
router.get("/reviews/:productId", reviewController.getProductReviews);

// Update a Review
/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the review to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: Updated rating for the product (1-5)
 *               comment:
 *                 type: string
 *                 description: Updated review comment
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 review:
 *                   type: object
 *                   description: Updated review object
 *       400:
 *         description: Bad request
 *       403:
 *         description: User not authorized to update the review
 *       404:
 *         description: Review not found
 */
router.put("/reviews/:id", verifyToken, reviewController.updateReview);

// Delete a Review
/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the review to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request
 *       403:
 *         description: User not authorized to delete the review
 *       404:
 *         description: Review not found
 */
router.delete("/reviews/:id", verifyToken, reviewController.deleteReview);

/**
 * @swagger
 * /products/variant/{variantId}:
 *   get:
 *     summary: Get variant details by variant ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         description: ID of the variant to retrieve details
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 variant:
 *                   type: object
 *                   description: Variant details
 *       400:
 *         description: Bad request
 *       404:
 *         description: Variant not found
 */
router.get(
  "/products/variant/:variantId",
  productController.fetchVariantDetails
);

module.exports = router;
