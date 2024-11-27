const productService = require("../services/productService");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      descriptionFileUrl,
      information,
      imageUrls,
      variants,
      attributes,
      categoryId,
      brandId,
    } = req.body;

    const product = await productService.createProduct({
      sellerId: req.user.id,
      name,
      price,
      descriptionFileUrl,
      information,
      imageUrls,
      variants,
      attributes,
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
    // Determine the user's role from the request object
    const userRole = req.user ? req.user.role : "guest"; // Default to "guest" if no user is logged in

    // Set query based on user role
    let query = {};
    if (userRole === "admin" || userRole === "seller") {
      // Admins and sellers can see both approved and pending products
      query = { "verify.status": { $in: ["approved", "pending"] } }; // Show both approved and pending
    } else {
      // Everyone else can only see approved products
      query = { "verify.status": "approved" };
    }

    // Fetch products based on the query
    const products = await productService.getAllProducts(query);

    // Return the products to the client
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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
    res.status(403).json({ error: err.message }); // Use 403 Forbidden if the user is not authorized
  }
};

// Verify product
exports.getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const products = await productService.getProductsByStatus(status);
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProductVerify = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, description } = req.body;

    const product = await productService.updateProductVerify(
      id,
      status,
      reason,
      description
    );
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Report product
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
