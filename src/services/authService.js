const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./emailService');
const jwt = require('jsonwebtoken');

exports.registerUser = async (fullName, email, password, dateOfBirth, phone, address, gender, role = 'user') => {
    // Validate the input fields
    if (!fullName || !email || !password || !dateOfBirth || !gender || !phone || !address) {
        throw new Error('All fields are required.');
    }
    // Validate full name (at least 2 words and no special characters)
    const fullNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)+$/;
    if (!fullNameRegex.test(fullName)) {
        throw new Error('Full name must contain at least two words and should not include special characters or numbers.');
    }
    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format.');
    }
    // Validate date of birth (user must be at least 18 years old)
    const dob = new Date(dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    const monthDifference = new Date().getMonth() - dob.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && new Date().getDate() < dob.getDate())) {
        age--;
    }
    // Validate gender
    if (!['male', 'female', 'other'].includes(gender)) {
        throw new Error('Invalid gender. Must be one of "male", "female", or "other".');
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


    // Generate a confirmation token and create the user
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ fullName, email, password, dateOfBirth, phone, address, gender, role, confirmationToken });

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

    // Generate tokens
    const accessToken = jwt.sign(
        {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Short-lived token
    );

    const refreshToken = jwt.sign(
        {
            id: user._id,
            email: user.email, // Including email for token verification purposes
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '3d' } // Long-lived token
    );
    return { accessToken, refreshToken };
};
