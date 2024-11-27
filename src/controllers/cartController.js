const cartService = require("../services/cartService");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add or update a product in the cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, count, deliveryAddress } = req.body;
    const cart = await cartService.addToCart(
      req.user.id,
      productId,
      variantId,
      count,
      deliveryAddress
    );
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const cart = await cartService.removeFromCart(
      req.user.id,
      productId,
      variantId
    );
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update the count of a product in the cart
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, variantId, count, deliveryAddress } = req.body;
    const cart = await cartService.updateCartItem(
      req.user.id,
      productId,
      variantId,
      count,
      deliveryAddress
    );
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.status(200).json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
