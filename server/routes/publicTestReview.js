/**
 * routes/publicTestReview.js  (Prompt 80 hardened)
 *
 * Changes vs Prompt 08:
 *   - Uses shared getPublishedFreeTest() helper for the isPublished guard.
 *
 * GET /api/free-tests/:testId/section/:sectionKey/review
 */

import { Router }      from "express";
import FreeMockSection from "../models/FreeMockSection.js";
import { SECTION_KEYS, SECTION_DISPLAY_NAMES as SECTION_NAMES } from "../config/freeTestSections.js";
import { getPublishedFreeTest } from "../utils/getPublishedFreeTest.js";

const router = Router();

router.get("/:testId/section/:sectionKey/review", async (req, res) => {
  try {
    const { testId, sectionKey } = req.params;

    if (!SECTION_KEYS.includes(sectionKey)) {
      return res.status(404).json({ message: "Section not found." });
    }

    // Shared published guard
    const { test, error, status } = await getPublishedFreeTest(testId);
    if (error) return res.status(status).json({ message: error });

    const sectionMeta = test.sections?.[sectionKey];
    if (!sectionMeta || sectionMeta.status !== "complete" || !sectionMeta.sectionRef) {
      return res.status(404).json({ message: "Section not available." });
    }

    const section = await FreeMockSection.findById(sectionMeta.sectionRef)
      .select("mcqs")
      .lean();

    if (!section) {
      return res.status(404).json({ message: "Section not found." });
    }

    // No shuffle preserve original order for consistent question numbering
    const mcqs = (section.mcqs ?? []).map((mcq) => ({
      _id:          mcq._id,
      question:     mcq.question,
      options:      mcq.options,
      imageUrl:     mcq.imageUrl || "",
      correctIndex: mcq.correctIndex,
    }));

    // Never cache a response containing correct answers
    res.set("Cache-Control", "no-store");

    return res.json({
      sectionKey,
      sectionName: SECTION_NAMES[sectionKey],
      mcqs,
    });
  } catch (err) {
    console.error("[publicTestReview] GET review →", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
