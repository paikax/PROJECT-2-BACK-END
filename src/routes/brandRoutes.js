const express = require('express');
const brandController = require('../controllers/brandController');
const { verifyToken } = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for brand CRUD
/**
 * @swagger
 * tags:
 *   name: brands
 *   description: API for managing brands
 */

// Create a brand (only sellers and admins can create)
/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [brands]
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
 *                 description: Name of the brand
 *                 example: Electronics brand
 *               description:
 *                 type: string
 *                 description: Description of the brand
 *                 example: This brand specializes in electronic products.
 *               imageUrl:
 *                 type: string
 *                 description: URL of the brand's image
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/brand'
 *       400:
 *         description: Bad request
 */
router.post(
  '/brands',
  verifyToken,
  authorizeRole('seller', 'admin'), // Only sellers and admins can create brands
  brandController.createBrand
);

// Get all brands (accessible to everyone)
/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Retrieve all brands
 *     tags: [brands]
 *     responses:
 *       200:
 *         description: List of all brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/brand'
 *       400:
 *         description: Bad request
 */
router.get('/brands', brandController.getAllBrands);

// Get single brand by ID (accessible to everyone)
/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Retrieve a brand by ID
 *     tags: [brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the brand to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: brand retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/brand'
 *       400:
 *         description: Bad request
 *       404:
 *         description: brand not found
 */
router.get('/brands/:id', brandController.getBrandById);

// Update a brand (only sellers and admins can update)
/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Update a brand by ID
 *     tags: [brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the brand to update
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
 *                 description: Updated name of the brand
 *                 example: Updated Electronics brand
 *               description:
 *                 type: string
 *                 description: Updated description of the brand
 *                 example: Updated brand description.
 *               imageUrl:
 *                 type: string
 *                 description: Updated URL of the brand's image
 *                 example: https://example.com/updated-image.jpg
 *     responses:
 *       200:
 *         description: brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/brand'
 *       400:
 *         description: Bad request
 *       404:
 *         description: brand not found
 */
router.put(
  '/brands/:id',
  verifyToken,
  authorizeRole('seller', 'admin'), // Only sellers and admins can update brands
  brandController.updateBrand
);

// Delete a brand (only admins can delete)
/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the brand to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: brand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                   example: brand deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: brand not found
 */
router.delete(
  '/brands/:id',
  verifyToken,
  authorizeRole('seller','admin'), // Only admins can delete brands
  brandController.deleteBrand
);

module.exports = router;