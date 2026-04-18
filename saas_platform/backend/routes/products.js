const express = require("express");
const { Product, Business } = require("../models");
const { authMiddleware, businessContextMiddleware } = require("../middleware");

const router = express.Router();

/**
 * POST /api/products
 * Create a new product
 */
router.post(
  "/:businessId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const { name, category, description, sku, imageUrl } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Product name required" });
      }

      // Check max products for plan
      const productCount = await Product.countDocuments({
        business: req.business._id,
      });
      if (productCount >= req.business.subscription.maxProducts) {
        return res.status(400).json({
          error: `Product limit (${req.business.subscription.maxProducts}) reached for your plan`,
        });
      }

      const product = new Product({
        business: req.business._id,
        name,
        category,
        description,
        sku,
        imageUrl,
      });

      await product.save();

      // Add to business
      req.business.products.push(product._id);
      req.business.analytics.totalProducts =
        (req.business.analytics.totalProducts || 0) + 1;
      await req.business.save();

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/products/:businessId
 * Get all products for a business
 */
router.get(
  "/:businessId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const { limit = 50, offset = 0, search } = req.query;

      let query = { business: req.business._id };

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });

      res.json({
        products,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/products/:businessId/:productId
 * Get detailed product information
 */
router.get(
  "/:businessId/:productId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId).populate({
        path: "reviews",
        options: { limit: 10, sort: { createdAt: -1 } },
      });

      if (
        !product ||
        product.business.toString() !== req.business._id.toString()
      ) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * PUT /api/products/:businessId/:productId
 * Update product information
 */
router.put(
  "/:businessId/:productId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);

      if (
        !product ||
        product.business.toString() !== req.business._id.toString()
      ) {
        return res.status(404).json({ error: "Product not found" });
      }

      const { name, category, description, sku, imageUrl } = req.body;

      if (name) product.name = name;
      if (category) product.category = category;
      if (description) product.description = description;
      if (sku) product.sku = sku;
      if (imageUrl) product.imageUrl = imageUrl;

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
 * DELETE /api/products/:businessId/:productId
 * Delete product
 */
router.delete(
  "/:businessId/:productId",
  authMiddleware,
  businessContextMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);

      if (
        !product ||
        product.business.toString() !== req.business._id.toString()
      ) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if owner or admin
      if (
        req.business.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "Not authorized to delete" });
      }

      // Remove from business
      await Business.findByIdAndUpdate(req.business._id, {
        $pull: { products: product._id },
      });

      await Product.findByIdAndDelete(req.params.productId);

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
