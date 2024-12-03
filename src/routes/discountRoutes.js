const express = require("express");
const discountController = require("../controllers/discountController");
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Create a Discount
router.post("/discounts", verifyToken, authorizeRole("seller"), discountController.createDiscount);

// Get All Discounts
router.get("/discounts", discountController.getDiscounts);

// Update a Discount
router.put("/discounts/:id", verifyToken, authorizeRole("seller"), discountController.updateDiscount);

// Delete a Discount
router.delete("/discounts/:id", verifyToken, authorizeRole("seller"), discountController.deleteDiscount);

module.exports = router;