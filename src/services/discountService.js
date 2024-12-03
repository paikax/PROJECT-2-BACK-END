const Discount = require("../models/Discount");
const Product = require("../models/Product");

exports.createDiscount = async ({ productId, discountPercentage, startDate, endDate }) => {
  // Check if there's an active discount for the product
  const activeDiscount = await Discount.findOne({
    productId,
    endDate: { $gte: new Date() }, // Check if the current date is within the discount period
  });

  if (activeDiscount) {
    throw new Error("A discount is already active for this product. Please wait until the current discount expires.");
  }

  // Create the discount entry
  const discount = new Discount({ productId, discountPercentage, startDate, endDate });
  await discount.save();

  // Fetch the product to update its price
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // Check and apply the discount
  if (product.originalPrice !== undefined && !isNaN(product.originalPrice)) {
    const originalProductPrice = product.price;
    product.price = parseFloat((product.originalPrice * (1 - discountPercentage / 100)).toFixed(2)); // Rounded to 2 decimals

    product.variants.forEach(variant => {
      if (variant.originalPrice !== undefined && !isNaN(variant.originalPrice)) {
        const originalVariantPrice = variant.price;
        variant.price = parseFloat((variant.originalPrice * (1 - discountPercentage / 100)).toFixed(2)); // Rounded to 2 decimals
        variant.originalPrice = originalVariantPrice;
      } else {
        throw new Error("Variant original price is missing or invalid.");
      }
    });

    await product.save();
  } else {
    throw new Error("Product original price is missing or invalid.");
  }

  return discount;
};

exports.getAllDiscounts = async () => {
  return await Discount.find().populate("productId");
};

exports.updateDiscount = async (id, updates) => {
  const discount = await Discount.findByIdAndUpdate(id, updates, { new: true });
  return discount;
};

exports.deleteDiscount = async (id) => {
  const discount = await Discount.findById(id);
  if (!discount) throw new Error("Discount not found");
  
  await Discount.deleteOne({ _id: id });

  // Optionally, reset product prices if needed
  const product = await Product.findById(discount.productId);
  if (product) {
    product.price = product.originalPrice; // Reset to original price
    product.variants.forEach(variant => {
      variant.price = variant.originalPrice; // Reset each variant
    });
    await product.save();
  }
};