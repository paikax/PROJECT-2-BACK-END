const Discount = require("../models/Discount");
const Product = require("../models/Product");

exports.createDiscount = async ({ productId, discountPercentage, startDate, endDate }) => {
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
    // Store original prices
    const originalProductPrice = product.price;
    product.price = product.originalPrice * (1 - discountPercentage / 100);

    // Update variant prices
    product.variants.forEach(variant => {
      if (variant.originalPrice !== undefined && !isNaN(variant.originalPrice)) {
        // Store original variant price
        const originalVariantPrice = variant.price;
        variant.price = variant.originalPrice * (1 - discountPercentage / 100);
        
        // Save the original price if needed (optional)
        variant.originalPrice = originalVariantPrice; // Retain original price
      } else {
        throw new Error("Variant original price is missing or invalid.");
      }
    });

    // Save the updated product
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
  
  await discount.remove();

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