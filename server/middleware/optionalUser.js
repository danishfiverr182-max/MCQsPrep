/**
 * middleware/optionalUser.js  (Part 9   Prompt 5)
 *
 * A non-blocking variant of userProtect (middleware/userAuth.js).
 *
 * Behaviour:
 *  - If a valid userToken cookie exists: verifies the JWT, loads the
 *    PremiumUser, and attaches it to req.user, then calls next().
 *  - If no cookie, an invalid/garbage token, or the user no longer
 *    exists in the database: sets req.user = null and calls next().
 *
 * NEVER returns 401/403.  Public routes that use this middleware remain
 * accessible to anonymous visitors; the handler simply checks whether
 * req.user is set to decide whether to add per-user flags to the response.
 */

import jwt from "jsonwebtoken";
import PremiumUser from "../models/PremiumUser.js";

export async function optionalUser(req, res, next) {
  req.user = null; // default   anonymous

  try {
    const token = req.cookies?.userToken;
    if (!token) return next(); // no cookie → anonymous

    // Verify signature and expiry   throws on bad token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Bad/expired token   treat as anonymous, never block
      return next();
    }

    // Load the user without sensitive fields
    const user = await PremiumUser.findById(decoded.id).select(
      "-password -plainPasswordForAdmin +activeSessionId +activeSessionExpiresAt"
    );

    // Only treat as logged-in if this token's session is still the account's
    // current active session   a token from a device that was logged out
    // (or displaced by another login) should not grant premium flags.
    if (user && decoded.sid && decoded.sid === user.activeSessionId && user.hasActiveSession()) {
      req.user = user; // fully populated PremiumUser with all instance methods
    }
  } catch {
    // Any unexpected error (DB down, etc.)   degrade gracefully
    req.user = null;
  }

  next();
}
