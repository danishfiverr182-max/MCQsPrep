/**
 * routes/userAuthRoutes.js  (Prompt 3   Expiry Enforcement & Access Control)
 *
 * Changes:
 *  - Added GET /check-access route (uses userProtect middleware).
 *    Returns { hasAccess: true } for logged-in, non-expired users.
 *    401 if no cookie / bad JWT, 403 if account expired.
 *    Frontend calls this on app load to confirm the session is still valid.
 */

import express   from "express";
import rateLimit from "express-rate-limit";
import { login, me, logout, checkAccess } from "../controllers/userAuthController.js";
import { userProtect }                     from "../middleware/userAuth.js";

const router = express.Router();

// ── IP-based rate limiter for the login endpoint ──────────────────────────────
const loginRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15-minute sliding window
  max:             20,              // max 20 login requests per IP per window
  standardHeaders: true,
  legacyHeaders:   false,

  handler: (_req, res) => {
    return res.status(429).json({
      message:
        "Too many login attempts from this IP. Please wait 15 minutes before trying again.",
    });
  },

  skip: () => process.env.NODE_ENV === "test",
});

// ── Routes ────────────────────────────────────────────────────────────────────
router.post("/login",         loginRateLimiter, login);
router.get( "/me",            userProtect,      me);
router.get( "/check-access",  userProtect,      checkAccess);
router.post("/logout",        logout);

export default router;
