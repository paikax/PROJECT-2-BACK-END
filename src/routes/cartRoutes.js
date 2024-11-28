const express = require("express");
const Order = require("../models/Order"); // Import the Order model
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/authMiddleware");
const moment = require("moment");
const config = require("config");
const querystring = require("querystring");
const crypto = require("crypto"); // Import crypto module
const router = express.Router();
const {
  vnp_TmnCode,
  vnp_HashSecret,
  vnp_Url,
  vnp_ReturnUrl,
} = require("../../config/vnpay");
const cartService = require("../services/cartService");

/**
 * @swagger
 * /cart/:
 *   get:
 *     summary: Retrieve the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: User ID
 *                 items:
 *                   type: array
 *                   description: List of items in the cart
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: Product ID
 *                       productDetails:
 *                         type: object
 *                         description: Details about the product
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: string
 *                           imageUrls:
 *                             type: array
 *                             items:
 *                               type: string
 *                       variantDetails:
 *                         type: object
 *                         description: Details about the variant
 *                         properties:
 *                           price:
 *                             type: string
 *                           stockQuantity:
 *                             type: number
 *                       count:
 *                         type: integer
 *                         description: Quantity of the product
 *       400:
 *         description: Bad request
 */
router.get("/cart/", verifyToken, cartController.getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add or update a product in the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *               variantId:
 *                 type: string
 *                 description: ID of the variant (if applicable)
 *               count:
 *                 type: integer
 *                 description: Quantity of the product
 *     responses:
 *       200:
 *         description: Product added or updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found or unavailable
 */
router.post("/cart/add", verifyToken, cartController.addToCart);

/**
 * @swagger
 * /cart/remove:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         description: ID of the product to remove
 *         schema:
 *           type: string
 *       - in: query
 *         name: variantId
 *         required: false
 *         description: ID of the variant to remove (if applicable)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed successfully
 *       404:
 *         description: Product not found in the cart
 *       400:
 *         description: Bad request
 */
router.delete("/cart/remove", verifyToken, cartController.removeFromCart);

/**
 * @swagger
 * /cart/update:
 *   patch:
 *     summary: Update the quantity of a product in the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to update
 *               variantId:
 *                 type: string
 *                 description: ID of the variant (if applicable)
 *               count:
 *                 type: integer
 *                 description: Updated quantity
 *     responses:
 *       200:
 *         description: Product quantity updated successfully
 *       404:
 *         description: Product not found in the cart
 *       400:
 *         description: Bad request
 */
router.patch("/cart/update", verifyToken, cartController.updateCartItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear the user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       400:
 *         description: Bad request
 */
router.delete("/cart/clear", verifyToken, cartController.clearCart);

/**
 * @swagger
 * /vnpay-checkout:
 *   post:
 *     summary: Initiate payment checkout via VNPay
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *                 description: Address for delivery
 *               bankCode:
 *                 type: string
 *                 description: Code of the bank (optional)
 *               language:
 *                 type: string
 *                 description: Language (e.g. "vn" or "en")
 *     responses:
 *       200:
 *         description: VNPay checkout URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vnpUrl:
 *                   type: string
 *                   description: VNPay payment URL
 *       400:
 *         description: Bad request, e.g., missing delivery address or empty cart
 */
router.post("/vnpay-checkout", verifyToken, async function (req, res, next) {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  const userId = req.user.id;

  const { deliveryAddress } = req.body;
  if (!deliveryAddress) {
    return res.status(400).json({ error: "Delivery address is required." });
  }

  // Fetch the user's shopping cart
  const cart = await cartService.getCart(userId);
  if (!cart || cart.items.length === 0) {
    return res
      .status(400)
      .json({ error: "Cart is empty. Cannot place an order." });
  }

  // Calculate total price
  const totalPrice = Math.round(
    cart.items.reduce((sum, item) => {
      const variantPrice = item.variantDetails
        ? parseFloat(item.variantDetails.price)
        : parseFloat(item.product.price);
      return sum + item.count * variantPrice;
    }, 0)
  );

  let tmnCode = vnp_TmnCode; // Use config file
  let secretKey = vnp_HashSecret; // Use config file
  let vnpUrl = vnp_Url; // Use config file
  let returnUrl = vnp_ReturnUrl; // Use config file
  let orderId = moment(date).format("DDHHmmss");

  let amount = totalPrice;
  let bankCode = req.body.bankCode;

  let locale = req.body.language;
  if (locale === null || locale === "") {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  return res.status(200).json({
    vnpUrl,
  });
});

/**
 * @swagger
 * /vnpay-success:
 *   get:
 *     summary: Handle VNPay payment success
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         required: true
 *         description: VNPay transaction reference
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_Amount
 *         required: true
 *         description: Amount paid
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_SecureHash
 *         required: true
 *         description: Secure hash for verification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified and order created successfully
 *       400:
 *         description: Invalid signature or cart is empty
 */
router.get("/vnpay-success", verifyToken, async function (req, res, next) {
  const userId = req.user ? req.user.id : null; // Get user ID from token
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = vnp_HashSecret;

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    if (!userId) {
      // Handle scenario where user ID is not found
      return res
        .status(400)
        .json({ error: "User ID not found. Unable to process the order." });
    }
    const cart = await cartService.getCart(userId);

    if (cart && cart.items.length > 0) {
      const totalQuantity = cart.items.reduce(
        (sum, item) => sum + item.count,
        0
      );

      // Calculate total price based on variant prices
      const totalPrice = Math.round(
        cart.items.reduce((sum, item) => {
          const variantPrice = item.variantDetails
            ? parseFloat(item.variantDetails.price)
            : parseFloat(item.product.price);
          return sum + item.count * variantPrice;
        }, 0)
      );

      const orderItems = cart.items.map((item) => ({
        productId: item.product, // Assuming item.product is the product ID
        variantId: item.variantId, // Assuming item.variantId is the variant ID (if applicable)
        quantity: item.count,
        price: item.variantDetails
          ? parseFloat(item.variantDetails.price)
          : parseFloat(item.product.price), // Use variant price if available
      }));

      const order = new Order({
        userId: userId,
        status: "Pending",
        paymentStatus: "Paid", // Set to Paid since payment is successful
        totalQuantity: totalQuantity,
        totalPrice: totalPrice, // Use the calculated total price here
        deliveryAddress: cart.deliveryAddress || "Default Address", // Adjust as needed
        orderItems: orderItems,
      });

      await order.save();
      await cartService.clearCart(userId); // Clear the cart after creating the order

      // Send order details as a JSON response
      return res.status(200).json({
        message: "Payment successful",
        order: {
          id: order._id,
          totalQuantity: order.totalQuantity,
          totalPrice: order.totalPrice, // Ensure this reflects the correct total price
          deliveryAddress: order.deliveryAddress,
          status: order.status,
          paymentStatus: order.paymentStatus,
          orderItems: order.orderItems,
        },
      });
    } else {
      return res.status(400).json({ error: "Cart is empty" });
    }
  } else {
    return res.status(400).json({ error: "Invalid signature" });
  }
});

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = router;
