const jwt = require("jsonwebtoken");



const verifyToken = (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({message: 'Authentication failed'});
        }

        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            console.log("The decoded user is: ", req.user);
            console.log("The decoded user is: ", req.user.role);
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