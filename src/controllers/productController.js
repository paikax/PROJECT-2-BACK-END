const productService = require("../services/productService");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      originalPrice,
      price,
      description,
      imageUrls,
      variants,
      categoryId,
      brandId,
    } = req.body;

    const product = await productService.createProduct({
      sellerId: req.user.id,
      name,
      originalPrice: originalPrice,
      price: price,
      description,
      imageUrls,
      variants,
      categoryId,
      brandId,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
      let userRole = "guest"; // Mặc định là guest
  
      // Kiểm tra token trong header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          // Giải mã token để lấy role
          const decoded = jwt.verify(token, process.env.JWT_SECRET); // Đảm bảo `JWT_SECRET` đúng
          userRole = decoded.role || "guest";
        } catch (err) {
          console.warn("Token verification failed:", err.message);
        }
      }
  
      // Base query (dành cho từng loại người dùng)
      let query = {};
      if (["admin", "seller"].includes(userRole)) {
        query["verify.status"] = { $in: ["approved", "pending"] };
      } else if (["guest", "user"].includes(userRole)) {
        query["verify.status"] = "approved";
      }
  
      // Các filter khác như trước
    const {
      category,
      brand,
      keyword,
      price,
      rating,
      variant,
      views,
      createdAt,
      status,
    } = req.query;

    // 1. Filter category (theo ID hoặc tên)
    if (category) {
      const categories = category.split(",");
      query.$or = query.$or || [];
      const categoryIds = categories.filter(id => mongoose.isValidObjectId(id));
      const categoryNames = categories.filter(name => !mongoose.isValidObjectId(name));
      if (categoryIds.length) query.$or.push({ categoryId: { $in: categoryIds } });
      if (categoryNames.length) {
        const categoryDocs = await Category.find({ name: { $in: categoryNames } });
        query.$or.push({ categoryId: { $in: categoryDocs.map(cat => cat._id) } });
      }
    }

    // 2. Filter brand (theo ID hoặc tên)
    if (brand) {
      const brands = brand.split(",");
      query.$or = query.$or || [];
      const brandIds = brands.filter(id => mongoose.isValidObjectId(id));
      const brandNames = brands.filter(name => !mongoose.isValidObjectId(name));
      if (brandIds.length) query.$or.push({ brandId: { $in: brandIds } });
      if (brandNames.length) {
        const brandDocs = await Brand.find({ name: { $in: brandNames } });
        query.$or.push({ brandId: { $in: brandDocs.map(br => br._id) } });
      }
    }

    // 3. Filter keyword (bao gồm name, description, sellerId.fullName)
    if (keyword) {
      query.$or = query.$or || [];
      query.$or.push(
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { "sellerId.fullName": { $regex: keyword, $options: "i" } }
      );
    }

    // 4. Filter price
    if (price) {
      const [minPrice, maxPrice] = price.split(",");
      query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    }

    
    // 6. Filter rating (theo khoảng)
    if (rating) {
      const [minRating, maxRating] = rating.split(",");
      query.rating = { $gte: parseFloat(minRating), $lte: parseFloat(maxRating) };
    }

    // 7. Filter variant (option và color nested trong variants.attributes)
    if (variant) {
      query["variants.attributes"] = { $regex: variant, $options: "i" };
    }

    // 8. Filter views (khoảng giá trị)
    if (views) {
      const [minViews, maxViews] = views.split(",");
      query.views = { $gte: parseInt(minViews, 10), $lte: parseInt(maxViews, 10) };
    }

    // 9. Filter createdAt (thời gian tạo sản phẩm)
    if (createdAt) {
      const [startDate, endDate] = createdAt.split(",");
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status) {
      query["verify.status"] = status;
    }

    // Lấy sản phẩm theo query và gửi phản hồi
    const products = await productService.getAllProducts(query);
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

  /* 
    1. hien tai chi filter dc san pham co A hoac B chu khong phai ca A va B
    2. chua filter duoc sellerId.fullName trong keyword va variant color, attribute. Chua filter duoc nhieu keyword 
    3. price,view, hoat dong bat thuong. Mot san pham co gia 94.36 khi nhap 1, => doi string thanh float trong model
    
  */
  
  

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };
    const product = await productService.updateProduct(req.params.id, updates);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

exports.getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const products = await productService.getProductsByStatus(status);
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Products by Seller ID
exports.getProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params; // Extract sellerId from the route parameter
    const products = await productService.getProductsBySellerId(sellerId);
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProductVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, description } = req.body;

    const product = await productService.updateProductVerify(id, {
      status,
      reason,
      description,
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.reportProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const report = await productService.addProductReport(id, userId, reason);

    res.status(200).json({ message: "Product reported successfully.", report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};