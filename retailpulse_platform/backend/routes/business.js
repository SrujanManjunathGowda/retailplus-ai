const express = require("express");
const { Business, Product, User } = require("../models");
const { authMiddleware, tenantContextMiddleware } = require("../middleware");

const router = express.Router();

/**
 * POST /business
 * Create new business
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, industry, website, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Business name required" });
    }

    const business = new Business({
      owner: req.user.id,
      name,
      industry,
      website,
      description,
      users: [req.user.id],
    });

    await business.save();

    // Add business to user
    const user = await User.findById(req.user.id);
    user.businesses.push(business._id);
    await user.save();

    res.status(201).json({
      message: "Business created successfully",
      business,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /business/:id
 * Get business details
 */
router.get(
  "/:id",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const business = await Business.findById(req.params.id)
        .populate("owner")
        .populate("products")
        .populate("users");

      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      res.json(business);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * PUT /business/:id
 * Update business details
 */
router.put(
  "/:id",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const { name, industry, website, description, settings } = req.body;

      const business = await Business.findById(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Check authorization
      if (
        business.owner.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this business" });
      }

      if (name) business.name = name;
      if (industry) business.industry = industry;
      if (website) business.website = website;
      if (description) business.description = description;
      if (settings) business.settings = { ...business.settings, ...settings };

      business.updatedAt = new Date();
      await business.save();

      res.json({
        message: "Business updated successfully",
        business,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * DELETE /business/:id
 * Delete business
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Only owner can delete
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this business" });
    }

    await Business.findByIdAndDelete(req.params.id);

    // Remove from user's businesses
    await User.updateMany(
      { businesses: req.params.id },
      { $pull: { businesses: req.params.id } },
    );

    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /business/:id/stats
 * Get business analytics summary
 */
router.get(
  "/:id/stats",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const business = await Business.findById(req.params.id).populate(
        "products",
      );

      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const stats = {
        totalProducts: business.products.length,
        totalReviews: business.products.reduce(
          (sum, p) => sum + (p.analytics?.totalReviews || 0),
          0,
        ),
        averageCSAT:
          business.products.length > 0
            ? business.products.reduce(
                (sum, p) => sum + (p.analytics?.csat || 0),
                0,
              ) / business.products.length
            : 0,
        averageNPS:
          business.products.length > 0
            ? business.products.reduce(
                (sum, p) => sum + (p.analytics?.nps || 0),
                0,
              ) / business.products.length
            : 0,
        subscription: business.subscription,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /business/:id/invite
 * Invite user to business
 */
router.post(
  "/:id/invite",
  authMiddleware,
  tenantContextMiddleware,
  async (req, res) => {
    try {
      const { email } = req.body;

      const business = await Business.findById(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Check authorization
      if (
        business.owner.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const invitedUser = await User.findOne({ email });
      if (!invitedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Add user to business
      if (!business.users.includes(invitedUser._id)) {
        business.users.push(invitedUser._id);
        await business.save();
      }

      // Add business to user
      if (!invitedUser.businesses.includes(business._id)) {
        invitedUser.businesses.push(business._id);
        await invitedUser.save();
      }

      res.json({ message: "User invited successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
