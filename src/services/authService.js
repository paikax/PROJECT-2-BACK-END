const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const emailService = require("./emailService");
const jwt = require("jsonwebtoken");
const agenda = require("../../config/agenda");

exports.registerUser = async (
  fullName,
  email,
  password,
  dateOfBirth,
  phone,
  address,
  gender,
  role = "user"
) => {
  // Validate the input fields
  if (!fullName || !email || !password) {
    throw new Error("All fields are required.");
  }
  // Validate full name (at least 2 words and no special characters)
  const fullNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)+$/;
  if (!fullNameRegex.test(fullName)) {
    throw new Error(
      "Full name must contain at least two words and should not include special characters or numbers."
    );
  }
  // Validate email format
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }
  // Validate date of birth (user must be at least 18 years old)
  const dob = new Date(dateOfBirth);
  const age = new Date().getFullYear() - dob.getFullYear();
  const monthDifference = new Date().getMonth() - dob.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && new Date().getDate() < dob.getDate())
  ) {
    age--;
  }
  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isBanned) {
      throw new Error(
        "This email is banned. You cannot sign up with this email."
      );
    }
    throw new Error("Email is already registered.");
  }
  // Validate password strength
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Generate a confirmation token and create the user
  const confirmationToken = crypto.randomBytes(32).toString("hex");
  const user = new User({
    fullName,
    email,
    password,
    dateOfBirth,
    phone,
    address,
    gender,
    role,
    confirmationToken,
  });

  await user.save();
  await emailService.sendConfirmationEmail(email, confirmationToken);

  // // Schedule deletion of unconfirmed users
  // await agenda.schedule("in 2 minutes", "delete unconfirmed user", {
  //   email,
  //   confirmationToken,
  // });

  return user;
};

exports.confirmUserEmail = async (token) => {
  const user = await User.findOne({ confirmationToken: token });
  if (!user) throw new Error("Invalid or expired token.");

  user.isConfirmed = true;
  user.confirmationToken = undefined;
  await user.save();

  return user;
};

exports.loginUser = async (email, password) => {
  // Validate the email and password
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password.");
  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password.");
  }
  if (user.isBanned) {
    throw new Error("Your account is banned. Please contact support.");
  }
  if (!user.isConfirmed) {
    throw new Error("Please confirm your email first.");
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
      imageUrl: user.imageUrl,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" } // Short-lived token
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // Long-lived token
  );
  return { accessToken, refreshToken };
};

exports.getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (err) {
    throw new Error("Failed to retrieve user by email");
  }
};

// Register a user with Google details
exports.registerUserFromGoogle = async (email, name, picture) => {
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists.");
    }

    // Create a new user with no password, as it's a Google login
    const newUser = new User({
      email,
      password: "HASSPASSWORD",
      fullName: name, // Default username based on email prefix
      role: "user", // Default role
      isConfirmed: true, // User is confirmed by default (since it's Google login)
      isActive: true, // User is active by default
      imageUrl: picture, // You can add the Google profile picture URL if available
    });

    // Save the new user
    await newUser.save();

    return newUser;
  } catch (err) {
    throw new Error("Failed to register user with Google: " + err.message);
  }
};
