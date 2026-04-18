const express = require("express");
const { Business, Product, Review, User } = require("../models");
const {
  authMiddleware,
  businessContextMiddleware,
  adminMiddleware,
} = require("../middleware");

const router = express.Router();

/**
 * POST /api/businesses
 * Create a new business
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, industry, website, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Business name required" });
    }

    // Check max businesses for free plan
    const userBusinesses = req.user.businesses || [];
    if (req.user.role === "business_user" && userBusinesses.length >= 3) {
      return res.status(400).json({
        error: "Free plan limited to 3 businesses. Upgrade to create more.",
      });
    }

    const business = new Business({
      owner: req.user._id,
      name,
      industry,
      website,
      description,
      users: [req.user._id],
      subscription: {
        plan: "free",
        maxUsers: 5,
        maxProducts: 10,
        apiCallsLimit: 10000,
      },
    });

    await business.save();

    // Add to user's businesses
    req.user.businesses.push(business._id);
    await req.user.save();

    res.status(201).json({
      message: "Business created successfully",
      business,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/businesses/:businessId
 * Get business details and statistics
 */
router.get(
  "/:businessId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const businessData = await req.business.populate([
        "owner",
        "users",
        "products",
      ]);

      const reviews = await Review.countDocuments({
        business: req.business._id,
      });
      const products = await Product.countDocuments({
        business: req.business._id,
      });

      res.json({
        business: businessData,
        stats: {
          totalReviews: reviews,
          totalProducts: products,
          totalUsers: businessData.users.length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * PUT /api/businesses/:businessId
 * Update business information
 */
router.put(
  "/:businessId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      // Only owner or admin can update
      if (
        req.business.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this business" });
      }

      const { name, industry, website, description, settings } = req.body;

      if (name) req.business.name = name;
      if (industry) req.business.industry = industry;
      if (website) req.business.website = website;
      if (description) req.business.description = description;
      if (settings) {
        req.business.settings = { ...req.business.settings, ...settings };
      }

      req.business.updatedAt = new Date();
      await req.business.save();

      res.json({
        message: "Business updated successfully",
        business: req.business,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/businesses/:businessId/analytics
 * Get business analytics dashboard
 */
router.get(
  "/:businessId/analytics",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const reviews = await Review.find({ business: req.business._id });
      const products = await Product.find({ business: req.business._id });

      if (reviews.length === 0) {
        return res.json({
          summary: {
            totalReviews: 0,
            csat: 0,
            nps: 0,
            averageConfidence: 0,
          },
          sentimentBreakdown: {
            positive: 0,
            negative: 0,
            neutral: 0,
            mixed: 0,
          },
          topProducts: [],
          recentInsights: [],
        });
      }

      // Calculate metrics
      let csat = 0;
      let nps = 0;
      let totalConfidence = 0;
      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0,
        mixed: 0,
      };
      const departmentIssues = {};

      reviews.forEach((review) => {
        const sentiment = review.analysis.sentiment || "neutral";
        sentimentCounts[sentiment]++;
        totalConfidence += review.analysis.overallConfidence || 0;

        // Track department issues
        const dept = review.analysis.department || "General";
        departmentIssues[dept] =
          (departmentIssues[dept] || 0) +
          (review.analysis.priority === "HIGH" ? 1 : 0);
      });

      csat = Math.round(
        ((sentimentCounts.positive + sentimentCounts.mixed * 0.5) /
          reviews.length) *
          100,
      );
      nps = Math.round(
        ((sentimentCounts.positive - sentimentCounts.negative) /
          reviews.length) *
          100,
      );

      // Get top products by review count
      const topProducts = products
        .sort((a, b) => b.analytics.totalReviews - a.analytics.totalReviews)
        .slice(0, 5)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          reviews: p.analytics.totalReviews,
          csat: p.analytics.csat,
          nps: p.analytics.nps,
        }));

      res.json({
        summary: {
          totalReviews: reviews.length,
          totalProducts: products.length,
          csat,
          nps,
          averageConfidence: Math.round(totalConfidence / reviews.length),
        },
        sentimentBreakdown: sentimentCounts,
        departmentIssues,
        topProducts,
        timeRange: {
          oldest: reviews[reviews.length - 1]?.createdAt,
          newest: reviews[0]?.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /api/businesses/:businessId/users
 * Add user to business
 */
router.post(
  "/:businessId/users",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Only owner can add users
      if (req.business.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Only owner can add users" });
      }

      const newUser = await User.findOne({ email: email.toLowerCase() });
      if (!newUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already in business
      if (
        req.business.users.some(
          (uid) => uid.toString() === newUser._id.toString(),
        )
      ) {
        return res.status(400).json({ error: "User already in business" });
      }

      // Check max users
      if (req.business.users.length >= req.business.subscription.maxUsers) {
        return res
          .status(400)
          .json({ error: "User limit reached for subscription plan" });
      }

      req.business.users.push(newUser._id);
      await req.business.save();

      newUser.businesses.push(req.business._id);
      await newUser.save();

      res.json({
        message: "User added successfully",
        business: req.business,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * DELETE /api/businesses/:businessId/users/:userId
 * Remove user from business
 */
router.delete(
  "/:businessId/users/:userId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      // Only owner can remove users
      if (req.business.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Only owner can remove users" });
      }

      req.business.users = req.business.users.filter(
        (uid) => uid.toString() !== req.params.userId,
      );
      await req.business.save();

      const user = await User.findById(req.params.userId);
      user.businesses = user.businesses.filter(
        (bid) => bid.toString() !== req.business._id.toString(),
      );
      await user.save();

      res.json({ message: "User removed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
