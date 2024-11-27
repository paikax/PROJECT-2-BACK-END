const ShoppingCart = require("../models/ShoppingCart");
const Product = require("../models/Product");

// Get the shopping cart for a user
exports.getCart = async (userId) => {
  const cart = await ShoppingCart.findOne({ user: userId }).populate(
    "items.product",
    "name price imageUrls"
  );
  if (!cart) {
    return { user: userId, items: [], deliveryAddress: "" }; // Return empty cart if none exists
  }

  // Add variant details manually
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product && item.variantId) {
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId
      );
      if (variant) {
        item.variantDetails = variant;
      }
    }
  }

  return cart;
};

// Add or update a product in the cart
exports.addToCart = async (userId, productId, variantId, count, deliveryAddress) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  if (variantId) {
    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) {
      throw new Error("Variant not found for this product");
    }
  }

  let cart = await ShoppingCart.findOne({ user: userId });
  if (!cart) {
    // Create a new cart if none exists
    cart = new ShoppingCart({ user: userId, items: [], deliveryAddress });
  } else {
    // Update delivery address if it exists
    if (deliveryAddress) {
      cart.deliveryAddress = deliveryAddress;
    }
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId && item.variantId === variantId
  );

  if (existingItem) {
    existingItem.count += count;
  } else {
    cart.items.push({ product: productId, variantId, count });
  }

  await cart.save();
  return cart;
};


// Remove a product from the cart
exports.removeFromCart = async (userId, productId, variantId) => {
  const cart = await ShoppingCart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  // Remove the product with the specific variant
  cart.items = cart.items.filter(
    (item) =>
      item.product.toString() !== productId || item.variantId !== variantId
  );

  await cart.save();
  return cart;
};

// Update the count of a product in the cart
exports.updateCartItem = async (userId, productId, variantId, count) => {
  const cart = await ShoppingCart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (item) =>
      item.product.toString() === productId && item.variantId === variantId
  );

  if (!item) {
    throw new Error("Product not in cart");
  }

  if (count <= 0) {
    // Remove the item if count is 0 or less
    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId || item.variantId !== variantId
    );
  } else {
    item.count = count; // Update count
  }

  if (cart.items.length === 0) {
    // If the cart is empty, delete the cart
    await ShoppingCart.findByIdAndDelete(cart._id);
    return { message: "Cart deleted successfully" };
  }

  await cart.save();
  return cart;
};

// Clear the cart
exports.clearCart = async (userId) => {
  const cart = await ShoppingCart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  // Delete the cart entirely
  await ShoppingCart.findByIdAndDelete(cart._id);
  return { message: "Cart cleared successfully" };
};
