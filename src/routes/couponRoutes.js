const express = require("express");
const couponController = require("../controllers/couponController");
const { verifyToken } = require("../middleware/authMiddleware"); // Middleware to verify admin's token
const authorizeRole = require('../middleware/roleMiddleware');
const router = express.Router();

// Create a coupon
router.post("/coupons", verifyToken, authorizeRole('admin') ,couponController.createCoupon);

// Get all coupons
router.get("/coupons", couponController.getAllCoupons);

// Get a coupon by ID
router.get("/coupons/:id", couponController.getCouponById);

// Update a coupon
router.patch("/coupons/:id", verifyToken, authorizeRole('admin') ,couponController.updateCoupon);

// Delete a coupon
router.delete("/coupons/:id", verifyToken, authorizeRole('admin') ,couponController.deleteCoupon);

module.exports = router;