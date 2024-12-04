const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order"); // Ensure you import the Order model

// Create a Review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if the user has paid for the product
    const order = await Order.findOne({
      userId: req.user.id,
      "orderItems.productId": productId,
      paymentStatus: "Paid",
    });

    if (!order) {
      return res
        .status(403)
        .json({ error: "You must purchase the product before reviewing." });
    }

    const review = new Review({
      userId: req.user.id,
      productId,
      rating,
      comment,
    });

    await review.save();

    // Update the product's average rating
    const reviews = await Review.find({ productId });

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(2); // Average rating to 2 decimal places

    const product = await Product.findById(productId);
    if (product) {
      product.rating = averageRating; // Update product rating
      await product.save();
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Reviews for a Product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate(
      "userId",
      "fullName"
    );
    res.status(200).json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a Review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params; // ID of the review to update
    const { rating, comment } = req.body;

    // Find the review
    const review = await Review.findById(id);

    // Check if the review exists and belongs to the logged-in user
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this review" });
    }

    // Update the review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Update product's average rating
    const reviews = await Review.find({ productId: review.productId });

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(2);

    const product = await Product.findById(review.productId);
    if (product) {
      product.rating = averageRating;
      await product.save();
    }

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a Review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // ID of the review to delete

    // Find the review
    const review = await Review.findById(id);

    // Check if the review exists and belongs to the logged-in user
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this review" });
    }

    // Delete the review
    const productId = review.productId;
    await review.deleteOne();

    // Update product's average rating
    const reviews = await Review.find({ productId });

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(2) : 0;

    const product = await Product.findById(productId);
    if (product) {
      product.rating = averageRating;
      await product.save();
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};