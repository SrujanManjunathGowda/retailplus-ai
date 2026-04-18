const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 * Verifies JWT token in Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key",
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Tenant Context Middleware
 * Ensures user has access to the requested business
 */
const tenantContextMiddleware = async (req, res, next) => {
  try {
    const { businessId } = req.params || req.body;

    if (!businessId) {
      return next(); // Some routes don't require businessId
    }

    // Check if user owns or has access to this business
    const { User } = require("../models");
    const user = await User.findById(req.user.id).populate("businesses");

    const hasAccess = user.businesses.some(
      (b) => b._id.toString() === businessId,
    );

    if (!hasAccess && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied to this business" });
    }

    req.business = businessId;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Tenant context error: " + error.message });
  }
};

/**
 * Admin-only Middleware
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  authMiddleware,
  tenantContextMiddleware,
  adminMiddleware,
  errorHandler,
};
