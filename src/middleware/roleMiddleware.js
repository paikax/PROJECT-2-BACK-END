const authorizeRoles = (...allowedRole) => {
    return (req, res, next) => {
        if (!allowedRole.includes(req.user.role)) {
            return res.status(401).json({ error: `Access denied. Only ${role}s are allowed.` });
        }
        next();
    }
}

module.exports = authorizeRoles;