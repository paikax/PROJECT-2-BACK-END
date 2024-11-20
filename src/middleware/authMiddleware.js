const Redis = require("ioredis");
const jwt = require("jsonwebtoken");

const redis = new Redis();



const verifyToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({message: 'Authentication failed'});
        }

        try {
            // Check if token is blacklisted
            const isBlacklisted = await redis.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
            }

            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        }catch(err) {
            res.status(401).json({message: 'Invalid token.'});
        }
    } else {
        return res.status(401).json({message: 'Please login first'});
    }

}


exports.checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};



module.exports = verifyToken;