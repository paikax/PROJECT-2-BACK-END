const User = require('../models/User');

const checkBanStatus = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Ensure email is provided
        if (!email) {
            return res.status(400).json({ error: "Email is required to check ban status." });
        }

        // Fetch the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the user is banned
        if (user.isBanned) {
            return res.status(403).json({ error: "Your account is banned." });
        }

        // If not banned, proceed to the next middleware/controller
        next();
    } catch (err) {
        res.status(500).json({ error: "Failed to check ban status: " + err.message });
    }
};

module.exports = checkBanStatus;
