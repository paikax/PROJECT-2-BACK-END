const authService = require('../services/authService');


exports.register = async (req, res) => {
    try {
        const { email, password, dateOfBirth, gender } = req.body;
        await authService.registerUser(email, password, dateOfBirth, gender);
        res.status(201).send('Registration successful! Please check your email to confirm your account.');
    } catch (err) {
        // Send a more specific error message from the exception
        res.status(400).json({ error: err.message });
    }
};

exports.confirmEmail = async (req, res) => {
    try {
        const { token } = req.query;

        await authService.confirmUserEmail(token);
        res.status(200).send('Email confirmed! You can now log in.');
    } catch (err) {
        // Send a more specific error message from the exception
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        res.status(200).json({ token });
    } catch (err) {
        // Send a more specific error message from the exception
        res.status(400).json({ error: err.message });
    }
};