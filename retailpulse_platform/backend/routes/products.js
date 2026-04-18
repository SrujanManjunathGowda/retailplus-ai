const express = require("express");
const { Product, Business } = require("../models");
const { authMiddleware, tenantContextMiddleware } = require("../middleware");

const router = express.Router();

/**
 * POST /products
 * Create new product
 */
router.post("/", authMiddleware, tenantContextMiddleware, async (req, res) => {
  try {
    const { businessId, name, description, category } = req.body;

    if (!businessId || !name) {
      return res
        .status(400)
        .json({ error: "Business ID and product name required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const product = new Product({
      business: businessId,
      name,
      description,
      category: category || "general",
      analytics: {
        totalReviews: 0,
        csat: 0,
        nps: 0,
        averageConfidence: 0,
      },
    });

    await product.save();

    // Add to business
    business.products.push(product._id);
    await business.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /products/:businessId
 * Get all products for a business
 */
router.get(
  "/business/:businessId",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const products = await Product.find({ business: req.params.businessId })
        .populate("reviews")
        .sort({ createdAt: -1 });

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /products/:id
 * Get single product details
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("business")
      .populate("reviews");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /products/:id
 * Update product details
 */
router.put(
  "/:id",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const { name, description, category } = req.body;

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (name) product.name = name;
      if (description) product.description = description;
      if (category) product.category = category;

      product.updatedAt = new Date();
      await product.save();

      res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * DELETE /products/:id
 * Delete product
 */
router.delete(
  "/:id",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await Product.findByIdAndDelete(req.params.id);

      // Remove from business
      await Business.updateOne(
        { _id: product.business },
        { $pull: { products: req.params.id } },
      );

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /products/:id/summary
 * Get product analytics summary
 */
router.get("/:id/summary", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const reviews = product.reviews || [];

    const sentimentCounts = reviews.reduce(
      (acc, r) => {
        const s = r.analysis?.sentiment || "neutral";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0, mixed: 0 },
    );

    const avgConfidence =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.analysis?.confidence || 0), 0) /
          reviews.length
        : 0;

    const highPriorityReviews = reviews.filter(
      (r) => r.analysis?.priority === "high",
    ).length;

    res.json({
      productName: product.name,
      totalReviews: reviews.length,
      sentiment: sentimentCounts,
      averageConfidence: Math.round(avgConfidence),
      sentimentPercentage: {
        positive:
          Math.round((sentimentCounts.positive / reviews.length) * 100) || 0,
        negative:
          Math.round((sentimentCounts.negative / reviews.length) * 100) || 0,
        neutral:
          Math.round((sentimentCounts.neutral / reviews.length) * 100) || 0,
        mixed: Math.round((sentimentCounts.mixed / reviews.length) * 100) || 0,
      },
      highPriorityReviews,
      lastUpdated: product.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
