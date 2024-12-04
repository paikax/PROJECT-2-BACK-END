const authorizeRoles = (...allowedRole) => {
    return (req, res, next) => {
        if (!allowedRole.includes(req.user.role)) {
            return res.status(401).send('Not authorized');
        }
        next();
    }
}

module.exports = authorizeRoles;

const roles = ["guest", "user", "seller", "admin"];

// Middleware để kiểm tra quyền
const authorizeRole = (requiredRole) => (req, res, next) => {
  const userRole = req.user ? req.user.role : "guest";

  if (roles.indexOf(userRole) >= roles.indexOf(requiredRole)) {
    return next();
  }

  res.status(403).json({ success: false, message: "Access denied." });
};

module.exports = authorizeRole;