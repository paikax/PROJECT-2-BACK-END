const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Authentication failed" });

    if (tokenBlacklist.has(token)) {
      return res
        .status(401)
        .json({ message: "Token has been invalidated. Please log in again." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.isBanned)
        return res
          .status(403)
          .json({ message: "Access denied. User is banned." });

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token." });
    }
  } else {
    res.status(401).json({ message: "No token provided." });
  }
};

const addToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

const removeFromBlacklist = (token) => {
  tokenBlacklist.delete(token);
};

exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    // Use optional chaining to avoid errors if req.user is null
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

module.exports = { verifyToken, addToBlacklist, removeFromBlacklist };
