const express = require("express");
const couponController = require("../controllers/couponController");
const { verifyToken } = require("../middleware/authMiddleware"); // Middleware to verify seller's token
const authorizeRole = require('../middleware/roleMiddleware');
const router = express.Router();

// Create a coupon
router.post("/coupons", verifyToken, authorizeRole('seller') ,couponController.createCoupon);

// Get all coupons
router.get("/coupons", couponController.getAllCoupons);

// Get a coupon by ID
router.get("/coupons/:id", couponController.getCouponById);

// Update a coupon
router.patch("/coupons/:id", verifyToken, authorizeRole('seller') ,couponController.updateCoupon);

// Delete a coupon
router.delete("/coupons/:id", verifyToken, authorizeRole('seller') ,couponController.deleteCoupon);

module.exports = router;