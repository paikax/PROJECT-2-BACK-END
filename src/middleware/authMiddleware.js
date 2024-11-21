const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set();


const verifyToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({message: 'Authentication failed'});
        }
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
        }


        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        }catch(err) {
            res.status(401).json({message: 'Invalid token.'});
        }
    } else {
        return res.status(401).json({message: 'Please login first'});
    }

}

const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};


exports.checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};



module.exports = { verifyToken, addToBlacklist };