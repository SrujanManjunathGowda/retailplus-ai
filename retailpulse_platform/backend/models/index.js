const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Model - Handles authentication and user roles
 */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ["admin", "business_user"],
    default: "business_user",
  },
  businesses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Business" }],
  isActive: { type: Boolean, default: true },
  googleId: String,
  avatar: String,
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/**
 * Business Model - Tenant information
 */
const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  industry: String,
  website: String,
  logo: String,
  description: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  subscription: {
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    stripeCustomerId: String,
    renewalDate: Date,
  },
  settings: {
    language: { type: String, default: "en" },
    timezone: String,
    emailAlerts: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Product Model - Represents products/services being reviewed
 */
const productSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  name: { type: String, required: true },
  description: String,
  category: String,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  analytics: {
    totalReviews: { type: Number, default: 0 },
    csat: { type: Number, default: 0 },
    nps: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Review Model - Customer reviews with AI analysis
 */
const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  text: { type: String, required: true },
  rating: Number,
  source: {
    type: String,
    enum: ["manual", "api", "import"],
    default: "manual",
  },

  // AI Analysis Results
  analysis: {
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "mixed"],
    },
    confidence: { type: Number, min: 0, max: 100 },
    aspects: [
      {
        name: String,
        sentiment: String,
        confidence: Number,
      },
    ],
    priority: { type: String, enum: ["low", "medium", "high"] },
    department: {
      type: String,
      enum: ["product", "logistics", "support", "sales", "general"],
    },
    suggestedActions: [String],
    language: { type: String, default: "en" },
  },

  // Spam & Quality
  isSpam: { type: Boolean, default: false },
  spamScore: { type: Number, default: 0 },
  isDuplicate: { type: Boolean, default: false },

  // Status
  isResolved: { type: Boolean, default: false },
  response: String,
  responseGeneratedAt: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Insights Model - AI-generated business insights
 */
const insightSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title: String,
  description: String,
  type: { type: String, enum: ["trend", "anomaly", "recommendation", "alert"] },
  priority: { type: String, enum: ["low", "medium", "high"] },
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Business: mongoose.model("Business", businessSchema),
  Product: mongoose.model("Product", productSchema),
  Review: mongoose.model("Review", reviewSchema),
  Insight: mongoose.model("Insight", insightSchema),
};
