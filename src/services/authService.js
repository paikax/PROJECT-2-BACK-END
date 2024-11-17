const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./emailService');
const jwt = require('jsonwebtoken');

exports.registerUser = async (email, password, dateOfBirth, gender) => {
    // Validate the input fields
    if (!email || !password || !dateOfBirth || !gender) {
        throw new Error('All fields are required.');
    }

    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format.');
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email is already registered.');

    }

    // Validate password strength
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }

    // Validate date of birth (user must be at least 18 years old)
    const dob = new Date(dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) {
        throw new Error('You must be at least 18 years old.');
    }

    // Validate gender
    if (!['male', 'female', 'other'].includes(gender)) {
        throw new Error('Invalid gender. Must be one of "male", "female", or "other".');
    }

    // Generate a confirmation token and create the user
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ email, password, dateOfBirth, gender, confirmationToken });

    await user.save();
    await emailService.sendConfirmationEmail(email, confirmationToken);

    return user;
};

exports.confirmUserEmail = async (token) => {
    const user = await User.findOne({ confirmationToken: token });
    if (!user) throw new Error('Invalid or expired token.');

    user.isConfirmed = true;
    user.confirmationToken = undefined;
    await user.save();

    return user;
};

exports.loginUser = async (email, password) => {
    // Validate the email and password
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password.');

    if (!(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid email or password.');
    }

    if (!user.isConfirmed) {
        throw new Error('Please confirm your email first.');
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};
