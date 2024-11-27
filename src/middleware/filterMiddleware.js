const filterByRole = (req, res, next) => {
    const userRole = req.user ? req.user.role : 'guest'; // Default to "guest" if no user is logged in
    const sellerProductFilter = req.query.sellerProductFilter === 'true'; // Explicit filter toggle for seller's own products
    const userID = req.query.userID || (req.user ? req.user._id.toString() : null); // Get userID or use logged-in user's ID
    const productStatus = req.query.status; // Status filter (pending, approved, rejected)
  
    let query = {};
  
    if (userRole === 'admin') {
      // Admin: View all products or filter by seller and status
      if (userID) {
        query.seller = userID;
      }
      if (productStatus) {
        query.status = productStatus;
      }
    } else if (userRole === 'seller') {
        if (userID === req.user._id.toString() || sellerProductFilter) {
          // Nếu userID là ID của chính seller hoặc sellerProductFilter được bật
          query.seller = req.user._id;
      
          if (productStatus) {
            query.status = productStatus; // Lọc theo trạng thái nếu có
          }
        } else if (!userID) {
          // Xem tất cả sản phẩm đã được phê duyệt (của mình + của seller khác)
          query.status = 'approved';
        } else {
          // Xem sản phẩm đã được phê duyệt của một seller khác
          query.seller = userID;
          query.status = 'approved';
        }
    } else if (userRole === 'user') {
      // User: View approved products of a specific seller or all approved products
      if (userID) {
        query.seller = userID;
      }
      query.status = 'approved';
    } else {
      // Guest: View all approved products
      query.status = 'approved';
    }
  
    req.filterQuery = query;
    next();
  };
  
  module.exports = filterByRole;
  
  
  
  // middleware/filterProduct.js

const filterProduct = (req, res, next) => {
    let query = req.filterQuery || {}; // Get the query from filterByRole
  
    const { category, brand, price, rating, stockQuantity, views, keyword, mustHave, optional, exclude, createdAt, updatedAt } = req.query;
  
    // Filter by category
    if (category) {
      query.category = { $in: category.split(',') }; // Assuming category is passed as comma-separated values
    }
  
    // Filter by brand
    if (brand) {
      query.brand = { $in: brand.split(',') };
    }
  
    // Filter by price range
    if (price) {
      const priceRange = price.split(',');
      if (priceRange.length === 2) {
        query.price = { $gte: priceRange[0], $lte: priceRange[1] };
      }
    }
  
    // Filter by rating range
    if (rating) {
      const ratingRange = rating.split(',');
      if (ratingRange.length === 2) {
        query.rating = { $gte: ratingRange[0], $lte: ratingRange[1] };
      }
    }
  
    // Filter by stockQuantity range
    if (stockQuantity) {
      const stockRange = stockQuantity.split(',');
      if (stockRange.length === 2) {
        query["variants.stockQuantity"] = { $gte: stockRange[0], $lte: stockRange[1] };
      }
    }
  
    // Filter by views range
    if (views) {
      const viewsRange = views.split(',');
      if (viewsRange.length === 2) {
        query.views = { $gte: viewsRange[0], $lte: viewsRange[1] };
      }
    }
  
    // Search by keyword in multiple fields
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { "variants.name": { $regex: keyword, $options: "i" } },
        { "variants.additionalData": { $regex: keyword, $options: "i" } },
        { "attributes.name": { $regex: keyword, $options: "i" } },
        { "attributes.value": { $regex: keyword, $options: "i" } }
      ];
    }
  
    // Apply other filters like mustHave, optional, exclude, createdAt, updatedAt as needed
  
    // Add filters to the query
    req.filterQuery = query;
    next();
  };
  
  module.exports = filterProduct;
  