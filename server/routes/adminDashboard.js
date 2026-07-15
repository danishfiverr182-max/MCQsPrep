/**
 * routes/adminDashboard.js
 */

import { Router } from "express";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import Category from "../models/Category.js";
import Test from "../models/Test.js";
import FreeMockTest from "../models/FreeMockTest.js";
import PremiumUser from "../models/PremiumUser.js";

const router = Router();

/**
 * GET /api/admin/dashboard-stats
 *
 * Returns platform-wide counts for the admin dashboard stat cards.
 * Protected requires a valid admin JWT cookie via verifyAdmin.
 *
 * Response shape:
 *   { totalCategories, totalTests, totalFreeMockTests, totalUsers, activeUsers, expiredUsers }
 */
router.get("/dashboard-stats", verifyAdmin, async (req, res) => {
  try {
    const now = new Date();

    const [totalCategories, totalTests, totalFreeMockTests, totalUsers, totalActiveUsers, totalExpiredUsers] = await Promise.all([
      Category.countDocuments(),
      Test.countDocuments({ isPublished: true }),
      FreeMockTest.countDocuments({ isPublished: true }),
      PremiumUser.countDocuments(),
      PremiumUser.countDocuments({ expiresAt: { $gt: now } }),
      PremiumUser.countDocuments({ expiresAt: { $lte: now } }),
    ]);

    return res.json({
      totalCategories,
      totalTests,
      totalFreeMockTests,
      totalUsers,
      totalActiveUsers,
      totalExpiredUsers,
      // legacy aliases kept for any existing consumers
      activeUsers:  totalActiveUsers,
      expiredUsers: totalExpiredUsers,
    });
  } catch (err) {
    console.error("GET /api/admin/dashboard-stats error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
