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
            next();
        }catch(err) {
            res.status(401).json({message: 'Invalid token.'});
        }
    } else {
        return res.status(401).json({message: 'Please login first'});
    }

}

module.exports = verifyToken;