const brandService = require("../services/brandService");

// Create a brand
exports.createBrand = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const brand = await brandService.createBrand(name, description, imageUrl);
    res.status(201).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all brandes
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await brandService.getAllBrands();
    res.status(200).json(brands);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    res.status(200).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const brand = await brandService.updateBrand(req.params.id, req.body);
    res.status(200).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    await brandService.deleteBrand(req.params.id);
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
