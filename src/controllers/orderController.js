const orderService = require("../services/orderService");

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const order = await orderService.getOrderDetails(orderId, userId);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Logged-in user ID
    const { orderId } = req.params; // Order ID from the request

    await orderService.deleteOrder(orderId, userId);
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
