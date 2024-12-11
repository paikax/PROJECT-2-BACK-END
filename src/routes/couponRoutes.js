const express = require("express");
const couponController = require("../controllers/couponController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Coupons
 *     description: Operations related to coupons
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The code for the coupon
 *               discount:
 *                 type: number
 *                 description: The discount amount or percentage
 *               minCartPrice:
 *                 type: number
 *                 description: Minimum cart price to apply the coupon
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date of the coupon
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Bad request, e.g., missing required fields
 *       401:
 *         description: Unauthorized (invalid or missing token)
 */
router.post(
  "/coupons",
  verifyToken,
  authorizeRole("admin"),
  couponController.createCoupon
);

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Retrieve all coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: List of all coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the coupon
 *                   code:
 *                     type: string
 *                     description: The code for the coupon
 *                   discount:
 *                     type: number
 *                     description: The discount amount or percentage
 *                   minCartPrice:
 *                     type: number
 *                     description: Minimum cart price to apply the coupon
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                     description: Expiration date of the coupon
 */
router.get("/coupons", couponController.getAllCoupons);

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Get a coupon by ID
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the coupon
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 code:
 *                   type: string
 *                 discount:
 *                   type: number
 *                 minCartPrice:
 *                   type: number
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Coupon not found
 */
router.get("/coupons/:id", couponController.getCouponById);

/**
 * @swagger
 * /coupons/{id}:
 *   patch:
 *     summary: Update a coupon by ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the coupon
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The new code for the coupon
 *               discount:
 *                 type: number
 *                 description: The new discount amount or percentage
 *               minCartPrice:
 *                 type: number
 *                 description: New minimum cart price to apply the coupon
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: New expiration date of the coupon
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized (invalid or missing token)
 */
router.patch(
  "/coupons/:id",
  verifyToken,
  authorizeRole("admin"),
  couponController.updateCoupon
);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon by ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the coupon to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized (invalid or missing token)
 */
router.delete(
  "/coupons/:id",
  verifyToken,
  authorizeRole("admin"),
  couponController.deleteCoupon
);

/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply a coupon to the cart
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode:
 *                 type: string
 *                 description: The code of the coupon to apply
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Bad request, e.g., invalid coupon code
 *       401:
 *         description: Unauthorized (invalid or missing token)
 */
router.post("/coupons/apply", verifyToken, couponController.applyCoupon);

module.exports = router;
