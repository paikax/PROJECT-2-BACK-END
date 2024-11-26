const jwt = require("jsonwebtoken");
const User = require('../models/User');
const tokenBlacklist = new Set();

const verifyToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Adjusted split for better readability
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
        }

        try {
            // Verify the token and attach user info to the request
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            res.status(401).json({ message: 'Invalid token.' });
        }
    } else {
        // Allow unauthenticated users to access the route without a token
        req.user = null; // Set user to null if not authenticated
        next(); // Proceed to the next middleware or route handler
    }
};

const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};

exports.checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) { // Use optional chaining to avoid errors if req.user is null
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};
// Middleware kiểm tra vai trò
const authorizeRole = (...roles) => {
    return async (req, res, next) => {
        const user = await User.findById(req.user.id); // Tìm user từ database
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRole };

module.exports = { verifyToken, addToBlacklist };