const express = require('express');
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /cart/:
 *   get:
 *     summary: Retrieve the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: User ID
 *                 items:
 *                   type: array
 *                   description: List of items in the cart
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: Product ID
 *                       variantId:
 *                         type: string
 *                         description: Variant ID (if applicable)
 *                       count:
 *                         type: integer
 *                         description: Quantity of the product
 *       400:
 *         description: Bad request
 */
router.get('/cart/', verifyToken, cartController.getCart);


/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add or update a product in the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *                 example: "63cfb8a9e4b0e9a0f5a3e8d1"
 *               variantId:
 *                 type: string
 *                 description: ID of the variant (if applicable)
 *                 example: "63cfb8a9e4b0e9a0f5a3e8d2"
 *               count:
 *                 type: integer
 *                 description: Quantity of the product
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: User ID
 *                 items:
 *                   type: array
 *                   description: Updated cart items
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: Product ID
 *                       variantId:
 *                         type: string
 *                         description: Variant ID (if applicable)
 *                       count:
 *                         type: integer
 *                         description: Quantity of the product
 *       400:
 *         description: Bad request
 */
router.post('/cart/add', verifyToken, cartController.addToCart);

/**
 * @swagger
 * /cart/remove:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         description: ID of the product to remove
 *         schema:
 *           type: string
 *       - in: query
 *         name: variantId
 *         required: false
 *         description: ID of the variant to remove (if applicable)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: User ID
 *                 items:
 *                   type: array
 *                   description: Updated cart items
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: Product ID
 *                       variantId:
 *                         type: string
 *                         description: Variant ID
 *                       count:
 *                         type: integer
 *                         description: Quantity of the product
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found in the cart
 */
router.delete('/cart/remove', verifyToken, cartController.removeFromCart);

/**
 * @swagger
 * /cart/update:
 *   patch:
 *     summary: Update the quantity of a product in the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to update
 *                 example: "63cfb8a9e4b0e9a0f5a3e8d1"
 *               variantId:
 *                 type: string
 *                 description: ID of the variant (if applicable)
 *                 example: "63cfb8a9e4b0e9a0f5a3e8d2"
 *               count:
 *                 type: integer
 *                 description: Updated quantity
 *                 example: 3
 *     responses:
 *       200:
 *         description: Product quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: User ID
 *                 items:
 *                   type: array
 *                   description: Updated cart items
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: Product ID
 *                       variantId:
 *                         type: string
 *                         description: Variant ID
 *                       count:
 *                         type: integer
 *                         description: Quantity of the product
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found in the cart
 */
router.patch('/cart/update', verifyToken, cartController.updateCartItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                   example: "Cart cleared successfully"
 *       400:
 *         description: Bad request
 */
router.delete('/cart/clear', verifyToken, cartController.clearCart);

module.exports = router;
