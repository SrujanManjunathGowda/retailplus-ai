require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/business");
const productsRoutes = require("./routes/products");
const reviewsRoutes = require("./routes/reviews");

// Import middleware
const { errorHandler, requestLogger } = require("./middleware");

// Import AI service
const { initGroqModel } = require("./services/aiService");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/retailpulse_saas";

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "RetailPulse SaaS Platform",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Version
app.get("/api/version", (req, res) => {
  res.json({
    version: "1.0.0",
    features: [
      "AI-powered review analysis",
      "Groq integration",
      "Multi-tenant SaaS",
      "Real-time analytics",
      "CX metrics (CSAT, NPS, CES)",
    ],
  });
});

/**
 * Database Connection
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    setTimeout(connectDB, 5000); // Retry connection
  }
}

/**
 * Initialize Groq AI Model
 */
async function initializeAI() {
  try {
    await initGroqModel();
    console.log("✓ Groq AI Model initialized");
  } catch (error) {
    console.error("⚠ Groq AI initialization warning:", error.message);
    console.log("  Continuing with fallback AI analysis...");
  }
}

/**
 * API Routes
 */
// Auth routes
app.use("/api/auth", authRoutes);

// Business routes
app.use("/api/businesses", businessRoutes);

// Products routes
app.use("/api/products", productsRoutes);

// Reviews routes (with Groq AI analysis)
app.use("/api/reviews", reviewsRoutes);

/**
 * API Documentation
 */
app.get("/api/docs", (req, res) => {
  res.json({
    title: "RetailPulse SaaS Platform API",
    version: "1.0.0",
    description:
      "Enterprise AI-powered review analysis platform with Groq integration",
    baseUrl: "http://localhost:5000/api",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        refresh: "POST /api/auth/refresh",
        me: "GET /api/auth/me",
        logout: "POST /api/auth/logout",
      },
      businesses: {
        create: "POST /api/businesses",
        get: "GET /api/businesses/:businessId",
        update: "PUT /api/businesses/:businessId",
        analytics: "GET /api/businesses/:businessId/analytics",
        addUser: "POST /api/businesses/:businessId/users",
        removeUser: "DELETE /api/businesses/:businessId/users/:userId",
      },
      products: {
        create: "POST /api/products/:businessId",
        list: "GET /api/products/:businessId",
        get: "GET /api/products/:businessId/:productId",
        update: "PUT /api/products/:businessId/:productId",
        delete: "DELETE /api/products/:businessId/:productId",
      },
      reviews: {
        submit: "POST /api/reviews",
        list: "GET /api/reviews/:businessId",
        byProduct: "GET /api/reviews/:businessId/product/:productId",
        analytics: "GET /api/reviews/:businessId/analytics",
        resolve: "PUT /api/reviews/:businessId/resolve/:reviewId",
        delete: "DELETE /api/reviews/:businessId/:reviewId",
      },
    },
    features: {
      aiAnalysis: "Groq-powered sentiment analysis",
      cxMetrics: "CSAT, NPS, CES calculation",
      multiTenant: "Multi-business SaaS platform",
      analytics: "Real-time dashboard analytics",
      rateLimiting: "API call limits per plan",
      authentication: "JWT-based auth with roles",
    },
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

/**
 * Error Handler
 */
app.use(errorHandler);

/**
 * Start Server
 */
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Initialize AI
    await initializeAI();

    // Start listening
    app.listen(PORT, () => {
      console.log(
        "\n═══════════════════════════════════════════════════════════",
      );
      console.log("  RetailPulse SaaS Platform - Backend Server");
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      console.log(`✓ Server running on: http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ API Version: 1.0.0`);
      console.log(
        "═══════════════════════════════════════════════════════════\n",
      );
      console.log("Available Endpoints:");
      console.log("  • Health Check: GET /health");
      console.log("  • API Docs: GET /api/docs");
      console.log("  • Version: GET /api/version");
      console.log("  • Auth: POST /api/auth/login");
      console.log("  • Auth: POST /api/auth/register");
      console.log("  • Reviews: POST /api/reviews");
      console.log("  • Analytics: GET /api/reviews/:businessId/analytics");
      console.log("\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\nShutting down gracefully...");
  mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\nShutting down gracefully...");
  mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
