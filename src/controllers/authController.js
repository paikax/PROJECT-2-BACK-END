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
    const { email } = req.body; // Extract email from the Google token

    // Check if user exists
    const user = await authService.getUserByEmail(email);

    if (!user) {
      // User doesn't exist, register new user
      const newUser = await authService.registerUserFromGoogle(email);
      if (!newUser) {
        return res.status(400).json({ error: "Error registering the user." });
      }
      // User successfully created, login user
      const accessToken = jwt.sign(
        {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
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

    // User exists, log in and return token
    const token = await authService.loginUser(email, "Password123@"); // use a placeholder password
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
