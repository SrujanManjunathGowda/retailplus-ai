const jwt = require("jsonwebtoken");
const { User, Business } = require("../models");

/**
 * Authentication middleware - Verify JWT token
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "saas-secret-key",
    );
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token", details: error.message });
  }
};

/**
 * Business context middleware - Set business ID and verify access
 */
const businessContextMiddleware = async (req, res, next) => {
  try {
    const businessId =
      req.params.businessId || req.body.businessId || req.query.businessId;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check if user has access to this business
    const hasAccess =
      business.owner.toString() === req.user._id.toString() ||
      business.users.some(
        (uid) => uid.toString() === req.user._id.toString(),
      ) ||
      req.user.role === "admin";

    if (!hasAccess) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this business" });
    }

    req.business = business;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Rate limiting middleware
 */
const rateLimitMiddleware = async (req, res, next) => {
  try {
    if (!req.user) return next();

    const business = await Business.findOne({ users: req.user._id });
    if (!business) return next();

    const { apiCallsUsed, apiCallsLimit } = business.subscription;

    if (apiCallsUsed >= apiCallsLimit) {
      return res.status(429).json({
        error: "API rate limit exceeded",
        limit: apiCallsLimit,
        used: apiCallsUsed,
      });
    }

    // Increment usage
    business.subscription.apiCallsUsed = apiCallsUsed + 1;
    await business.save();

    res.on("finish", () => {
      // Log API usage for analytics
    });

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    next();
  }
};

/**
 * Admin only middleware
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const userId = req.user ? req.user._id : "anonymous";
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - User: ${userId}`,
    );
  });

  next();
};

module.exports = {
  authMiddleware,
  businessContextMiddleware,
  rateLimitMiddleware,
  adminMiddleware,
  errorHandler,
  requestLogger,
};
