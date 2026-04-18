const express = require("express");
const { Review, Product, Business, Insight } = require("../models");
const { authMiddleware, businessContextMiddleware } = require("../middleware");
const {
  analyzeSentiment,
  calculateCXMetrics,
  getTopInsights,
} = require("../services/aiService");

const router = express.Router();

/**
 * POST /api/reviews
 * Submit and analyze a new review with Groq AI
 */
router.post(
  "/",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const { productId, text, rating, source, customerName, customerEmail } =
        req.body;

      if (!productId || !text) {
        return res
          .status(400)
          .json({ error: "Product ID and review text required" });
      }

      if (text.length < 10) {
        return res
          .status(400)
          .json({ error: "Review must be at least 10 characters" });
      }

      // Get product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Verify product belongs to business
      if (product.business.toString() !== req.business._id.toString()) {
        return res.status(403).json({ error: "Product not in this business" });
      }

      // Create review with pending status
      const review = new Review({
        product: productId,
        business: req.business._id,
        text,
        rating: rating || 3,
        source: source || "manual",
        customerName,
        customerEmail,
        analysis: {
          status: "pending",
        },
      });

      // Analyze with Groq AI
      try {
        console.log(`[ReviewAnalysis] Analyzing review with Groq...`);
        const aiAnalysis = await analyzeSentiment(text);

        review.analysis = {
          status: aiAnalysis.status || "valid",
          sentiment: aiAnalysis.overallSentiment,
          overallConfidence: aiAnalysis.overallConfidence,
          explanation: aiAnalysis.explanation,
          priority: aiAnalysis.priority,
          impactAnalysis: aiAnalysis.impactAnalysis,
          department: aiAnalysis.department,
          aspects: aiAnalysis.aspects,
          insights: aiAnalysis.insights,
          suggestedActions: aiAnalysis.suggestedActions,
          language: "en",
          analyzedAt: new Date(),
        };
      } catch (aiError) {
        console.error("[ReviewAnalysis] Groq AI error:", aiError.message);
        review.analysis.status = "fallback";
        review.analysis.sentiment =
          text.includes("good") || text.includes("great")
            ? "positive"
            : "negative";
        review.analysis.overallConfidence = 50;
        review.analysis.explanation = "Analyzed with fallback logic";
      }

      // Save review
      await review.save();

      // Update product analytics
      product.reviews.push(review._id);
      product.analytics.totalReviews = product.reviews.length;
      await product.save();

      // Update business analytics
      req.business.analytics.totalReviews =
        (req.business.analytics.totalReviews || 0) + 1;
      await req.business.save();

      res.status(201).json({
        message: "Review submitted and analyzed successfully",
        review: {
          _id: review._id,
          text: review.text,
          rating: review.rating,
          analysis: review.analysis,
          createdAt: review.createdAt,
        },
      });
    } catch (error) {
      console.error("Review submission error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/reviews/:businessId
 * Get all reviews for a business with filtering
 */
router.get(
  "/:businessId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const {
        limit = 50,
        offset = 0,
        sentiment,
        priority,
        resolved,
      } = req.query;

      let query = { business: req.business._id };

      if (sentiment) {
        query["analysis.sentiment"] = sentiment;
      }
      if (priority) {
        query["analysis.priority"] = priority;
      }
      if (resolved !== undefined) {
        query.isResolved = resolved === "true";
      }

      const total = await Review.countDocuments(query);
      const reviews = await Review.find(query)
        .populate("product", "name category")
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });

      const sentimentCounts = {
        positive: await Review.countDocuments({
          ...query,
          "analysis.sentiment": "positive",
        }),
        negative: await Review.countDocuments({
          ...query,
          "analysis.sentiment": "negative",
        }),
        neutral: await Review.countDocuments({
          ...query,
          "analysis.sentiment": "neutral",
        }),
        mixed: await Review.countDocuments({
          ...query,
          "analysis.sentiment": "mixed",
        }),
      };

      res.json({
        reviews,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / parseInt(limit)),
        },
        sentimentBreakdown: sentimentCounts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/reviews/:businessId/product/:productId
 * Get reviews for a specific product
 */
router.get(
  "/:businessId/product/:productId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const product = await Product.findById(productId);
      if (
        !product ||
        product.business.toString() !== req.business._id.toString()
      ) {
        return res.status(404).json({ error: "Product not found" });
      }

      const reviews = await Review.find({ product: productId })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });

      const metrics = calculateCXMetrics(reviews);

      res.json({
        product: {
          _id: product._id,
          name: product.name,
          category: product.category,
        },
        reviews,
        metrics,
        total: await Review.countDocuments({ product: productId }),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/reviews/:businessId/analytics
 * Get comprehensive analytics for all reviews
 */
router.get(
  "/:businessId/analytics",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const reviews = await Review.find({ business: req.business._id });

      if (reviews.length === 0) {
        return res.json({
          totalReviews: 0,
          metrics: {
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
          topAspects: [],
          keyInsights: [],
        });
      }

      const metrics = calculateCXMetrics(reviews);
      const insights = getTopInsights(reviews);

      // Get top aspects
      const aspectCounts = {};
      reviews.forEach((review) => {
        Object.entries(review.analysis.aspects || {}).forEach(
          ([aspect, data]) => {
            if (!aspectCounts[aspect]) {
              aspectCounts[aspect] = 0;
            }
            aspectCounts[aspect]++;
          },
        );
      });

      const topAspects = Object.entries(aspectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([aspect, count]) => ({ aspect, mentions: count }));

      res.json({
        totalReviews: reviews.length,
        metrics,
        sentimentBreakdown: metrics.sentimentBreakdown,
        topAspects,
        keyInsights: insights,
        dateRange: {
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
 * PUT /api/reviews/:reviewId/resolve
 * Mark review as resolved with response
 */
router.put(
  "/:businessId/resolve/:reviewId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const { response } = req.body;
      const review = await Review.findById(req.params.reviewId);

      if (
        !review ||
        review.business.toString() !== req.business._id.toString()
      ) {
        return res.status(404).json({ error: "Review not found" });
      }

      review.isResolved = true;
      review.response = response;
      review.responseGeneratedAt = new Date();
      review.respondedBy = req.user._id;
      await review.save();

      res.json({
        message: "Review marked as resolved",
        review,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review (admin only)
 */
router.delete(
  "/:businessId/:reviewId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);

      if (
        !review ||
        review.business.toString() !== req.business._id.toString()
      ) {
        return res.status(404).json({ error: "Review not found" });
      }

      // Check if user is owner or admin
      if (
        req.user.role !== "admin" &&
        req.business.owner.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ error: "Not authorized to delete" });
      }

      // Remove from product
      await Product.findByIdAndUpdate(review.product, {
        $pull: { reviews: review._id },
      });

      await Review.findByIdAndDelete(req.params.reviewId);

      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
