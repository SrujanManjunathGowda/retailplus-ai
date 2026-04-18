const express = require("express");
const { Review, Product, Business, Insight } = require("../models");
const { authMiddleware, tenantContextMiddleware } = require("../middleware");

const router = express.Router();

/**
 * POST /reviews
 * Submit and analyze new review
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, text, rating, source } = req.body;

    if (!productId || !text) {
      return res
        .status(400)
        .json({ error: "Product ID and review text required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Verify user has access to product's business
    const business = await Business.findById(product.business);
    if (!business.users.includes(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Create review
    const review = new Review({
      product: productId,
      business: product.business,
      text,
      rating,
      source: source || "manual",
    });

    // TODO: Integrate AI analysis service
    // const analysis = await aiAnalysisService.analyzeReview(text, rating);
    // review.analysis = analysis;

    // For now, basic analysis
    review.analysis = {
      sentiment: detectSentiment(text),
      confidence: 75,
      priority: "medium",
      language: "en",
    };

    await review.save();

    // Update product analytics
    product.reviews.push(review._id);
    product.analytics.totalReviews = product.reviews.length;
    await product.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reviews/:productId
 * Get all reviews for a product
 */
router.get("/:productId", authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0, sentiment } = req.query;

    let query = { product: req.params.productId };

    if (sentiment) {
      query["analysis.sentiment"] = sentiment;
    }

    const reviews = await Review.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /reviews/:productId/analytics
 * Get analytics for a product's reviews
 */
router.get("/:productId/analytics", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId });

    if (reviews.length === 0) {
      return res.json({
        totalReviews: 0,
        sentimentBreakdown: { positive: 0, negative: 0, neutral: 0, mixed: 0 },
        averageConfidence: 0,
        topAspects: [],
        trends: [],
      });
    }

    const sentiment = reviews.reduce((acc, r) => {
      const s = r.analysis.sentiment || "neutral";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const avgConfidence =
      reviews.reduce((sum, r) => sum + (r.analysis.confidence || 0), 0) /
      reviews.length;

    const aspectCounts = {};
    reviews.forEach((r) => {
      (r.analysis.aspects || []).forEach((a) => {
        aspectCounts[a.name] = (aspectCounts[a.name] || 0) + 1;
      });
    });

    const topAspects = Object.entries(aspectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalReviews: reviews.length,
      sentimentBreakdown: sentiment,
      averageConfidence: Math.round(avgConfidence),
      topAspects,
      dateRange: {
        oldest: reviews[reviews.length - 1]?.createdAt,
        newest: reviews[0]?.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /reviews/:id
 * Update review (mark resolved, add response)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { response, isResolved } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (response) {
      review.response = response;
      review.responseGeneratedAt = new Date();
    }

    if (isResolved !== undefined) {
      review.isResolved = isResolved;
    }

    review.updatedAt = new Date();
    await review.save();

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /reviews/:id
 * Delete review
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Update product analytics
    const product = await Product.findById(review.product);
    if (product) {
      product.reviews = product.reviews.filter(
        (id) => id.toString() !== req.params.id,
      );
      product.analytics.totalReviews = product.reviews.length;
      await product.save();
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Simple sentiment detection (placeholder)
 */
function detectSentiment(text) {
  const positive = ["great", "excellent", "amazing", "love", "best", "perfect"];
  const negative = ["bad", "terrible", "awful", "hate", "worst", "poor"];

  const lowerText = text.toLowerCase();
  const hasPositive = positive.some((word) => lowerText.includes(word));
  const hasNegative = negative.some((word) => lowerText.includes(word));

  if (hasPositive && hasNegative) return "mixed";
  if (hasPositive) return "positive";
  if (hasNegative) return "negative";
  return "neutral";
}

module.exports = router;
