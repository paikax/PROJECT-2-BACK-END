const paginationMiddleware = (req, res, next) => {
    try {
      // Lấy các tham số `page` và `limit` từ query, với giá trị mặc định
      const page = parseInt(req.query.page, 10) || 1; // Mặc định là trang 1
      const limit = parseInt(req.query.limit, 10) || 10; // Mặc định là 10 item/trang
      if (page <= 0 || limit <= 0) {
        return res.status(400).json({ error: "Page and limit must be positive integers" });
      }
  
      // Tính toán `skip` để bỏ qua các item không thuộc trang hiện tại
      const skip = (page - 1) * limit;
  
      // Lưu thông tin phân trang vào `req.pagination`
      req.pagination = { page, limit, skip };
  
      next(); // Chuyển tiếp đến controller
    } catch (err) {
      res.status(500).json({ error: "Pagination error" });
    }
  };
  
  module.exports = paginationMiddleware;
  