/**
 * routes/publicCategories.js
 *
 * Public endpoint for category listings.
 * hasAccess = user is logged in AND account is not expired.
 * No per-category access check   premium users have access to all categories.
 */

import { Router } from "express";
import Category from "../models/Category.js";
import { optionalUser } from "../middleware/optionalUser.js";

const router = Router();

// ── GET /api/categories ───────────────────────────────────────
router.get("/", optionalUser, async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1 })
      .select("name slug order image description coverImageUrl isDefault")
      .lean();

    let shaped = categories;

    if (req.user) {
      const expired = req.user.isExpired();
      // Any logged-in, non-expired premium user has access to ALL categories.
      shaped = categories.map((cat) => ({
        ...cat,
        hasAccess:   !expired,
        userExpired: expired,
      }));
    }

    res.set("Cache-Control", req.user ? "private, max-age=30" : "public, max-age=60");

    return res.json(shaped);
  } catch (err) {
    console.error("GET /api/categories (public) error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
