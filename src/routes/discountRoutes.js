const express = require("express");
const discountController = require("../controllers/discountController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Discounts
 *   description: API for managing discounts
 */

// Create a Discount
/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Create a new discount
 *     tags: [Discounts]
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
 *               - discountPercentage
 *               - startDate
 *               - endDate
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to apply the discount
 *               discountPercentage:
 *                 type: number
 *                 description: Discount percentage (0-100)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the discount
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the discount
 *     responses:
 *       201:
 *         description: Discount created successfully
 *       400:
 *         description: Bad request
 */
router.post("/discounts", verifyToken, authorizeRole("seller"), discountController.createDiscount);

// Get All Discounts
/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: Retrieve all discounts
 *     tags: [Discounts]
 *     responses:
 *       200:
 *         description: List of discounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discount'
 *       400:
 *         description: Bad request
 */
router.get("/discounts", discountController.getDiscounts);

// Get Discounts by Seller
/**
 * @swagger
 * /discounts/seller:
 *   get:
 *     summary: Retrieve all discounts for the logged-in seller
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of discounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discount'
 *       401:
 *         description: Unauthorized
 */
router.get("/discounts/seller", verifyToken, discountController.getDiscountsBySellerId);

// Update a Discount
/**
 * @swagger
 * /discounts/{id}:
 *   put:
 *     summary: Update a discount by ID
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the discount to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discountPercentage:
 *                 type: number
 *                 description: Discount percentage (0-100)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the discount
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the discount
 *     responses:
 *       200:
 *         description: Discount updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Discount not found
 */
router.put("/discounts/:id", verifyToken, authorizeRole("seller"), discountController.updateDiscount);

// Delete a Discount
/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     summary: Delete a discount by ID
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the discount to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Discount not found
 */
router.delete("/discounts/:id", verifyToken, authorizeRole("seller"), discountController.deleteDiscount);

// Get Discounts by Seller
/**
 * @swagger
 * /discounts/seller:
 *   get:
 *     summary: Retrieve all discounts for the logged-in seller
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of discounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discount'
 *       401:
 *         description: Unauthorized
 */
router.get("/discounts/seller", verifyToken, discountController.getDiscountsBySellerId);

module.exports = router;