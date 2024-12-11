const express = require("express");
const Order = require("../models/Order"); // Import the Order model
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/authMiddleware");
const moment = require("moment");
const querystring = require("querystring");
const crypto = require("crypto"); // Import crypto module
const Coupon = require("../models/Coupon");
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
router.post(
  "/payment/vnpay-checkout",
  verifyToken,
  async function (req, res, next) {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const userId = req.user.id;
    const { deliveryAddress, bankCode, language, paymentMethod } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({ error: "Delivery address is required." });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required." });
    }

    // Fetch the user's shopping cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot place an order." });
    }

    // Calculate total price
    let totalPrice = Math.round(
      cart.items.reduce((sum, item) => {
        const variantPrice = item.variantDetails
          ? parseFloat(item.variantDetails.price)
          : parseFloat(item.product.price);
        return sum + item.count * variantPrice;
      }, 0)
    );

    // Initialize discount to 0
    let discount = 0;

    // Check if a coupon is applied from the cart
    if (cart.appliedCoupon) {
      const couponCode = cart.appliedCoupon; // Get the coupon code from the cart
      const coupon = await Coupon.findOne({
        code: couponCode,
        validity: { $gte: new Date() },
      });

      if (coupon) {
        if (totalPrice >= coupon.minCartPrice) {
          discount = coupon.discount; // Apply the coupon discount
        } else {
          return res.status(400).json({
            error: `Coupon requires a minimum cart price of ${coupon.minCartPrice}. Your cart total is ${totalPrice}.`,
          });
        }
      } else {
        return res
          .status(400)
          .json({ error: "Invalid or expired coupon code." });
      }
    }

    // Calculate final price after discount
    const finalPrice = totalPrice - (totalPrice * discount) / 100;

    // VNPay configuration and logic
    let tmnCode = vnp_TmnCode; // Use config file
    let secretKey = vnp_HashSecret; // Use config file
    let vnpUrl = vnp_Url; // Use config file
    let returnUrl = vnp_ReturnUrl; // Use config file
    let orderId = moment(date).format("DDHHmmss");

    let amount = finalPrice;
    let locale = language || "vn"; // Default to Vietnamese if not provided
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Payment for order ID:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100; // VNPay expects amount in cents
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    if (bankCode) {
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
      couponCode: cart.appliedCoupon || null, // Optionally include the applied coupon code in the response
      discount, // Include the discount amount applied
    });
  }
);

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
router.get(
  "/payment/vnpay_success",
  verifyToken,
  async function (req, res, next) {
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
        return res
          .status(400)
          .json({ error: "User ID not found. Unable to process the order." });
      }

      const cart = await cartService.getCart(userId);
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty." });
      }

      const totalQuantity = cart.items.reduce(
        (sum, item) => sum + item.count,
        0
      );

      const totalPrice = Math.round(
        cart.items.reduce((sum, item) => {
          const variantPrice = item.variantDetails
            ? parseFloat(item.variantDetails.price)
            : parseFloat(item.product.price);
          return sum + item.count * variantPrice;
        }, 0)
      );

      const orderItems = cart.items.map((item) => ({
        productId: item.product,
        variantId: item.variantId,
        quantity: item.count,
        price: item.variantDetails
          ? parseFloat(item.variantDetails.price)
          : parseFloat(item.product.price),
      }));

      // Handle coupon if applicable
      let couponCode = cart.appliedCoupon || null; // Get coupon code from cart
      let discount = 0;

      if (couponCode) {
        const coupon = await Coupon.findOne({
          code: couponCode,
          validity: { $gte: new Date() },
        });

        if (coupon) {
          if (totalPrice >= coupon.minCartPrice) {
            discount = coupon.discount; // Apply the coupon discount
          } else {
            return res.status(400).json({
              error: `Coupon requires a minimum cart price of ${coupon.minCartPrice}. Your cart total is ${totalPrice}.`,
            });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Invalid or expired coupon code." });
        }
      }

      // Calculate final price after discount
      const finalPrice = totalPrice - (totalPrice * discount) / 100;

      const order = new Order({
        userId: userId,
        status: "Pending",
        paymentStatus: "Paid",
        paymentMethod: cart.paymentMethod || "VNPay", // Include payment method
        totalQuantity: totalQuantity,
        totalPrice: finalPrice, // Use discounted price here
        deliveryAddress: cart.deliveryAddress || "Default Address",
        orderItems: orderItems,
        couponCode: couponCode, // Save coupon code
        discountAmount: discount > 0 ? (totalPrice * discount) / 100 : 0, // Save discount amount
      });

      await order.save();
      await cartService.clearCart(userId); // Clear the cart after creating the order

      return res.status(200).json({
        message: "Payment successful",
        order: {
          id: order._id,
          totalQuantity: order.totalQuantity,
          totalPrice: order.totalPrice,
          deliveryAddress: order.deliveryAddress,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          orderItems: order.orderItems,
          couponCode: order.couponCode, // Include coupon code in response
          discountAmount: order.discountAmount, // Include discount amount in response
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid signature" });
    }
  }
);

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
