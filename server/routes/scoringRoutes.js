/**
 * routes/scoringRoutes.js  (Part 10   Prompts 1 + 5)
 *
 * Mounts the scoring engine at /api/results.
 *
 * POST /api/results/submit
 *   No auth required   guests submitting free tests are allowed.
 *   The route injects req.userId before calling the controller:
 *     - If a valid userToken cookie is present, injects req.user._id.
 *     - Otherwise injects the string "guest".
 *   This keeps the controller decoupled from authentication details.
 *
 * GET /api/results/overall/:testId          ← NEW (Prompt 5)
 *   Returns all section results for the caller's test + user combination
 *   and the computed overall pass/fail verdict.
 *   ⚠️  Must be registered BEFORE /:testId/:sectionType so Express does
 *   not mistake "overall" for a sectionType param.
 *
 * GET /api/results/:testId/:sectionType
 *   Also auth-optional.  Returns the most recent result for the caller's
 *   userId (or "guest" if unauthenticated) for that test+section.
 *
 * Mount in server/index.js:
 *   import scoringRoutes from "./routes/scoringRoutes.js";
 *   app.use("/api/results", scoringRoutes);
 */

import { Router } from "express";
import {
  submitSection,
  getResult,
  resetResults,
  getOverallResult,
} from "../controllers/scoringController.js";
import { optionalUser } from "../middleware/optionalUser.js";

const router = Router();

// Inject req.userId (ObjectId or "guest") without hard-blocking unauthenticated callers.
// optionalUser loads req.user if a valid cookie is present; does nothing otherwise.
function injectUserId(req, _res, next) {
  req.userId = req.user?._id ?? "guest";
  next();
}

// POST /api/results/submit
router.post("/submit", optionalUser, injectUserId, submitSection);

// GET /api/results/overall/:testId  ← Must come before /:testId/:sectionType
router.get("/overall/:testId", optionalUser, injectUserId, getOverallResult);

// DELETE /api/results/reset/:testId
router.delete("/reset/:testId", optionalUser, injectUserId, resetResults);

// GET /api/results/:testId/:sectionType
router.get("/:testId/:sectionType", optionalUser, injectUserId, getResult);

export default router;
