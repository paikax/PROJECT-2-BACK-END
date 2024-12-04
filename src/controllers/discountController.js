const discountService = require("../services/discountService");

exports.createDiscount = async (req, res) => {
    try {
      const { productId, discountPercentage, startDate, endDate } = req.body;
  
      // Validate discount percentage
      if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ error: "Invalid discount percentage." });
      }
  
      // Pass sellerId from req.user.id
      const discount = await discountService.createDiscount({
        productId,
        discountPercentage,
        startDate,
        endDate,
        sellerId: req.user.id, // Include sellerId
      });
      res.status(201).json(discount);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await discountService.getAllDiscounts();
    res.status(200).json(discounts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const discount = await discountService.updateDiscount(req.params.id, req.body);
    res.status(200).json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    await discountService.deleteDiscount(req.params.id);
    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDiscountsBySellerId = async (req, res) => {
    try {
      const sellerId = req.user.id; // Assuming this is the logged-in seller's ID
      const discounts = await discountService.getDiscountsBySellerId(sellerId);
      
      // Format the response to include specified fields
      const formattedDiscounts = discounts.map(discount => ({
        sellerId: discount.sellerId,
        discountPercentage: discount.discountPercentage,
        startDate: discount.startDate,
        endDate: discount.endDate,
        createdAt: discount.createdAt,
        updatedAt: discount.updatedAt,
        __v: discount.__v,
      }));
  
      res.status(200).json(formattedDiscounts);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      res.status(400).json({ error: err.message });
    }
  };