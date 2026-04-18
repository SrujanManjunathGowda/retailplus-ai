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
    enum: ["admin", "business_user", "analyst"],
    default: "business_user",
  },
  businesses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Business" }],
  isActive: { type: Boolean, default: true },
  googleId: String,
  avatar: String,
  lastLogin: Date,
  twoFactorEnabled: { type: Boolean, default: false },
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
 * Business Model - Tenant information for SaaS
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

  // SaaS Subscription
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
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    renewalDate: Date,
    autoRenew: { type: Boolean, default: true },
    trialEndsAt: Date,
    maxUsers: { type: Number, default: 5 },
    maxProducts: { type: Number, default: 10 },
    apiCallsLimit: { type: Number, default: 10000 },
    apiCallsUsed: { type: Number, default: 0 },
  },

  // Analytics & Metrics
  analytics: {
    totalReviews: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    csat: { type: Number, default: 0 },
    nps: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 },
    lastAnalysisUpdate: Date,
  },

  // Groq AI Configuration
  groqSettings: {
    enabled: { type: Boolean, default: true },
    analysisModel: { type: String, default: "llama-3.1-8b-instant" },
    batchProcessing: { type: Boolean, default: true },
    confidenceThreshold: { type: Number, default: 70 },
  },

  // Settings
  settings: {
    language: { type: String, default: "en" },
    timezone: String,
    emailAlerts: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: true },
    notificationEmail: String,
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
  sku: String,
  imageUrl: String,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

  // Product Analytics
  analytics: {
    totalReviews: { type: Number, default: 0 },
    csat: { type: Number, default: 0 },
    nps: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 },
    sentimentBreakdown: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      mixed: { type: Number, default: 0 },
    },
    lastAnalysisUpdate: Date,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Review Model - Customer reviews with advanced AI analysis
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
  rating: { type: Number, min: 1, max: 5 },
  source: {
    type: String,
    enum: ["manual", "api", "import", "email"],
    default: "manual",
  },
  customerName: String,
  customerEmail: String,

  // Advanced AI Analysis Results (Groq-powered)
  analysis: {
    status: {
      type: String,
      enum: ["pending", "valid", "invalid", "fallback"],
      default: "pending",
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "mixed", "UNCERTAIN"],
    },
    overallConfidence: { type: Number, min: 0, max: 100 },
    explanation: String,
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    impactAnalysis: String,
    department: {
      type: String,
      enum: [
        "Product Team",
        "Logistics",
        "Customer Service",
        "Sales",
        "General",
      ],
    },

    // Aspect-based analysis
    aspects: mongoose.Schema.Types.Mixed,
    insights: [String],
    suggestedActions: [String],

    language: { type: String, default: "en" },
    analyzedAt: Date,
  },

  // Quality Control
  isSpam: { type: Boolean, default: false },
  spamScore: { type: Number, default: 0 },
  isDuplicate: { type: Boolean, default: false },
  flags: [String],

  // Response Management
  isResolved: { type: Boolean, default: false },
  response: String,
  responseGeneratedAt: Date,
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Engagement
  isHelpful: { type: Number, default: 0 },
  isUnhelpful: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Insights Model - AI-generated business insights and reports
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
  type: {
    type: String,
    enum: ["trend", "anomaly", "recommendation", "alert", "report"],
  },
  priority: { type: String, enum: ["low", "medium", "high"] },
  category: String,
  data: mongoose.Schema.Types.Mixed,
  metrics: {
    affected_reviews: Number,
    confidence_level: Number,
    trend_direction: String,
  },
  isRead: { type: Boolean, default: false },
  actionTaken: Boolean,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

/**
 * Dashboard Report Model - Pre-computed analytics
 */
const reportSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  reportType: {
    type: String,
    enum: ["daily", "weekly", "monthly", "custom"],
  },
  period: {
    start: Date,
    end: Date,
  },
  metrics: {
    totalReviews: Number,
    csat: Number,
    nps: Number,
    ces: Number,
    averageConfidence: Number,
    sentimentBreakdown: mongoose.Schema.Types.Mixed,
  },
  topAspects: [
    {
      aspect: String,
      mentions: Number,
      sentiment: String,
    },
  ],
  keyInsights: [String],
  recommendations: [String],
  generatedAt: { type: Date, default: Date.now },
  exportedAt: Date,
});

/**
 * API Usage Model - Track API calls for rate limiting
 */
const apiUsageSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  endpoint: String,
  method: String,
  status: Number,
  responseTime: Number,
  tokens: Number,
  timestamp: { type: Date, default: Date.now, expires: 2592000 }, // Auto-delete after 30 days
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Business: mongoose.model("Business", businessSchema),
  Product: mongoose.model("Product", productSchema),
  Review: mongoose.model("Review", reviewSchema),
  Insight: mongoose.model("Insight", insightSchema),
  Report: mongoose.model("Report", reportSchema),
  ApiUsage: mongoose.model("ApiUsage", apiUsageSchema),
};
