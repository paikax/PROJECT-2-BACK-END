const authService = require("../services/authService");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      dateOfBirth,
      phone,
      address,
      gender,
      role,
    } = req.body;
    await authService.registerUser(
      fullName,
      email,
      password,
      dateOfBirth,
      phone,
      address,
      gender,
      role
    );
    res
      .status(201)
      .send(
        "Registration successful! Please check your email to confirm your account."
      );
  } catch (err) {
    // Send a more specific error message from the exception
    res.status(400).json({ error: err.message });
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;

    await authService.confirmUserEmail(token);
    res.status(200).send("Email confirmed! You can now log in.");
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

exports.googleLogin = async (req, res) => {
  try {
    const { email, name, picture } = req.body; // Extract email from the Google token

    // Check if user exists
    const user = await authService.getUserByEmail(email);

    if (!user) {
      // User doesn't exist, register new user
      const newUser = await authService.registerUserFromGoogle(
        email,
        name,
        picture
      );
      if (!newUser) {
        return res.status(400).json({ error: "Error registering the user." });
      }
      // User successfully created, login user
      const accessToken = jwt.sign(
        {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          address: newUser.address,
          gender: newUser.gender,
          role: newUser.role,
          imageUrl: newUser.imageUrl,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" } // Short-lived token
      );

      const refreshToken = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" } // Long-lived token
      );
      return res.status(201).json({ accessToken, refreshToken });
    }

    // If user exists, just return a token for the logged-in user
    const accessToken = jwt.sign(
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        address: user.address,
        gender: user.gender,
        role: user.role,
        imageUrl: user.imageUrl,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
