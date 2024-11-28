
/**
 * Middleware: filterByRole
 * Description: Generates a MongoDB query based on the user's role and input query parameters.
 * 
 * Features:
 * - Admin: Can view all products or filter by seller and/or status.
 * - Seller:
 *   - Can toggle between viewing their own products(all status) or all approved products.
 *   - Can filter their own products by status or view approved products of other sellers.
 * - User: Can view approved products (optionally filtered by seller).
 * - Guest: Can only view approved products.
 * 
 * Input Query Parameters:
 * - `sellerProductFilter` (boolean): Toggles seller's view of their own products.
 * - `userID` (string): Filters products by a specific seller.
 * - `status` (string): Filters products by their status (e.g., pending, approved).
 * 
 * Output:
 * - Adds a `filterQuery` object to `req` with the generated query.
 */

const filterByRole = (req, res, next) => {
    const userRole = req.user ? req.user.role : 'guest'; 
    const sellerProductFilter = req.query.sellerProductFilter === 'true'; 
    const userID = req.query.userID || (req.user ? req.user._id.toString() : null);
    const productStatus = req.query.status; 
  
    let query = {};
  
    if (userRole === 'admin') {
      if (userID) {
        query.seller = userID;
      }
      if (productStatus) {
        query.status = productStatus;
      }
    } else if (userRole === 'seller') {
        if (userID === req.user._id.toString() || sellerProductFilter) {
          query.seller = req.user._id;
          if (productStatus) {
            query.status = productStatus;
        } else if (!userID) {
          query.status = 'approved';
        } else {
          query.seller = userID;
          query.status = 'approved';
        }
    } else if (userRole === 'user') {
      if (userID) {
        query.seller = userID;
      }
      query.status = 'approved';
    } else {
      query.status = 'approved';
    }
    req.filterQuery = query;
    next();
  };
}
  module.exports = filterByRole;
  
const filterProduct = (req, res, next) => {
    let query = req.filterQuery || {}; 
    const { category, brand, price, rating, stockQuantity, views, keyword, mustHave, optional, exclude, createdAt, updatedAt } = req.query;
    if (category) {
      query.category = { $in: category.split(',') }; // Assuming category is passed as comma-separated values
    }
  
    if (brand) {
      query.brand = { $in: brand.split(',') };
    }
  
    if (price) {
      const priceRange = price.split(',');
      if (priceRange.length === 2) {
        query.price = { $gte: priceRange[0], $lte: priceRange[1] };
      }
    }
  
    if (rating) {
      const ratingRange = rating.split(',');
      if (ratingRange.length === 2) {
        query.rating = { $gte: ratingRange[0], $lte: ratingRange[1] };
      }
    }
  
    if (stockQuantity) {
      const stockRange = stockQuantity.split(',');
      if (stockRange.length === 2) {
        query["variants.stockQuantity"] = { $gte: stockRange[0], $lte: stockRange[1] };
      }
    }
  
    if (views) {
      const viewsRange = views.split(',');
      if (viewsRange.length === 2) {
        query.views = { $gte: viewsRange[0], $lte: viewsRange[1] };
      }
    }
  
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
  
    req.filterQuery = query;
    next();
  };
  
  module.exports = filterProduct;
  