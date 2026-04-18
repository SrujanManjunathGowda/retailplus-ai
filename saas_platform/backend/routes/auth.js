const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Business } = require("../models");
const { authMiddleware } = require("../middleware");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user and create business
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName || "User",
      lastName: lastName || "",
      role: "business_user",
    });

    await user.save();

    // Create initial business for user
    const business = new Business({
      owner: user._id,
      name: businessName || `${firstName}'s Business`,
      users: [user._id],
      subscription: {
        plan: "free",
        status: "active",
        maxUsers: 5,
        maxProducts: 10,
        apiCallsLimit: 10000,
      },
    });

    await business.save();

    // Update user with business
    user.businesses.push(business._id);
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "saas-secret-key",
      { expiresIn: "30d" },
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      business: {
        _id: business._id,
        name: business.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "saas-secret-key",
      { expiresIn: "30d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      businesses: user.businesses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post("/refresh", authMiddleware, (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET || "saas-secret-key",
      { expiresIn: "30d" },
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("businesses");

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
      businesses: user.businesses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token deletion)
 */
router.post("/logout", authMiddleware, (req, res) => {
  res.json({ message: "Logout successful" });
});

module.exports = router;
