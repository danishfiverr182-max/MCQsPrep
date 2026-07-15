/**
 * middleware/userAuth.js  (Prompt 3   Expiry Enforcement & Access Control)
 *
 * Changes:
 *  - userProtect now enforces expiry via user.isExpired() (already present).
 *  - Removed any category-level access check   the only gate is:
 *    (1) valid JWT cookie present, and (2) account not expired.
 *  - req.user is attached as { id, email, expiresAt, isActive } on success.
 *  - optionalUserAuth is unchanged   never blocks; sets req.user = null if
 *    no cookie, bad JWT, deleted user, or expired account.
 */

import jwt         from "jsonwebtoken";
import PremiumUser from "../models/PremiumUser.js";

const ACCESS_EXPIRED_RESPONSE = {
  code:    "ACCESS_EXPIRED",
  message: "Your premium access has expired. Please contact admin to renew.",
};

/**
 * Strict auth   rejects unauthenticated or expired requests.
 * Attaches req.user on success.
 * Access check: (1) valid userToken cookie + (2) account not expired.
 * No category-level access check.
 */
export async function userProtect(req, res, next) {
  try {
    const token = req.cookies?.userToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    const user = await PremiumUser.findById(decoded.id).select(
      "-password -plainPasswordForAdmin +activeSessionId +activeSessionExpiresAt"
    );

    if (!user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    // Session check   if this token's session id no longer matches the
    // account's current active session (logged out, forced out by admin,
    // or displaced), reject it even though the JWT signature is still valid.
    if (!decoded.sid || decoded.sid !== user.activeSessionId || !user.hasActiveSession()) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    // Expiry check   403 so the frontend can distinguish expired vs. unauthenticated
    if (user.isExpired()) {
      return res.status(403).json(ACCESS_EXPIRED_RESPONSE);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("userProtect error:", err);
    return res.status(401).json({ message: "Not authenticated." });
  }
}

/**
 * Optional auth   never blocks the request.
 * If a valid, non-expired userToken cookie is present, populates req.user.
 * Otherwise req.user stays null and next() is called normally.
 *
 * Used on public listing routes that want to show lock icons to logged-in users
 * without gating non-logged-in visitors.
 */
export async function optionalUserAuth(req, res, next) {
  try {
    const token = req.cookies?.userToken;

    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
      return next();
    }

    const user = await PremiumUser.findById(decoded.id).select(
      "-password -plainPasswordForAdmin +activeSessionId +activeSessionExpiresAt"
    );

    if (
      !user ||
      user.isExpired() ||
      !decoded.sid ||
      decoded.sid !== user.activeSessionId ||
      !user.hasActiveSession()
    ) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch {
    req.user = null;
    next();
  }
}
