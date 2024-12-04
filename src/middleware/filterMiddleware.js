const mongoose = require("mongoose");
const Category = require("../models/Category");
const Brand = require("../models/Brand");

const isValidRange = (range) => {
  const [min, max] = range.split(",");
  return !isNaN(min) && !isNaN(max);
};

const combinedFilter = async (req, res, next) => {
  try {
    req.filterQuery = req.filterQuery || {};

    const userRole = req.user ? req.user.role : "guest";
    const userID = req.query.userID || (req.user ? req.user._id.toString() : null);
    const productStatus = req.query.status;
    const { category, brand, price, rating, stockQuantity, views, keyword } = req.query;

    // Xử lý lọc theo vai trò
    if (userRole === "admin") {
      if (userID) req.filterQuery.sellerId = userID;
      req.filterQuery["verify.status"] = productStatus || { $in: ["approved", "pending"] };
    } else if (userRole === "seller") {
      req.filterQuery.sellerId = userID || req.user._id;
      req.filterQuery["verify.status"] = productStatus || { $in: ["approved", "pending"] };
    } else {
      req.filterQuery["verify.status"] = "approved";
    }

    // Lọc category
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        req.filterQuery.categoryId = category;
      } else {
        const categoryDoc = await Category.findOne({ name: { $regex: category, $options: "i" } });
        if (categoryDoc) req.filterQuery.categoryId = categoryDoc._id;
      }
    }

    // Lọc brand
    if (brand) {
      if (mongoose.isValidObjectId(brand)) {
        req.filterQuery.brandId = brand;
      } else {
        const brandDoc = await Brand.findOne({ name: { $regex: brand, $options: "i" } });
        if (brandDoc) req.filterQuery.brandId = brandDoc._id;
      }
    }

    // Lọc price
    if (price && isValidRange(price)) {
      const [minPrice, maxPrice] = price.split(",");
      req.filterQuery.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    }

    // Lọc rating
    if (rating && isValidRange(rating)) {
      const [minRating, maxRating] = rating.split(",");
      req.filterQuery.rating = { $gte: parseFloat(minRating), $lte: parseFloat(maxRating) };
    }

    // Lọc stockQuantity
    if (stockQuantity && isValidRange(stockQuantity)) {
      const [minStock, maxStock] = stockQuantity.split(",");
      req.filterQuery["variants.stockQuantity"] = {
        $gte: parseInt(minStock, 10),
        $lte: parseInt(maxStock, 10),
      };
    }

    // Lọc views
    if (views && isValidRange(views)) {
      const [minViews, maxViews] = views.split(",");
      req.filterQuery.views = { $gte: parseInt(minViews, 10), $lte: parseInt(maxViews, 10) };
    }

    // Lọc keyword
    if (keyword) {
      req.filterQuery.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    console.log("Combined Filter Query:", JSON.stringify(req.filterQuery, null, 2));
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { combinedFilter };
