const authorizeRoles = (...allowedRole) => {
    return (req, res, next) => {
        if (!allowedRole.includes(req.user.role)) {
            return res.status(401).send('Not authorized');
        }
        next();
    }
}

module.exports = authorizeRoles;