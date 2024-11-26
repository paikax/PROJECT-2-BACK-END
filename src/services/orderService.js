const ShoppingCart = require("../models/ShoppingCart");
const Order = require("../models/Order");

exports.createOrder = async (userId, deliveryAddress) => {
  const cart = await ShoppingCart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty. Cannot place an order.");
  }

  // Calculate total quantity and price
  const totalQuantity = cart.items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + item.count * item.product.price, 0);

  // Create order items
  const orderItems = cart.items.map((item) => ({
    productId: item.product._id,
    variantId: item.variantId,
    quantity: item.count,
    price: item.product.price,
  }));

  // Create order
  const order = new Order({
    userId,
    totalQuantity,
    totalPrice,
    deliveryAddress,
    orderItems,
  });

  await order.save();

  // Clear the shopping cart
  await ShoppingCart.findByIdAndDelete(cart._id);

  return order;
};

exports.getUserOrders = async (userId) => {
  return await Order.find({ userId }).populate("orderItems.productId", "name price imageUrls");
};

exports.getOrderDetails = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, userId }).populate("orderItems.productId", "name price imageUrls");
  if (!order) throw new Error("Order not found");
  return order;
};

exports.deleteOrder = async (orderId, userId) => {
    const order = await Order.findOne({ _id: orderId, userId });
  
    if (!order) throw new Error("Order not found or not authorized to delete.");
  
    await Order.deleteOne({ _id: orderId });
  };