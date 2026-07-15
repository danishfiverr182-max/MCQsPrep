/**
 * routes/publicTestHub.js  (Prompt 80 hardened)
 *
 * Changes vs Prompt 08:
 *   - Uses shared getPublishedFreeTest() helper for the isPublished guard.
 *   - Zero-MCQ guard: sections with no MCQs return available:false.
 *
 * GET /api/free-tests/:testId
 */

import { Router }      from "express";
import FreeMockSection from "../models/FreeMockSection.js";
import { SECTION_KEYS, SECTION_DISPLAY_NAMES as SECTION_NAMES } from "../config/freeTestSections.js";
import { getPublishedFreeTest } from "../utils/getPublishedFreeTest.js";

const router = Router();

router.get("/:testId", async (req, res) => {
  try {
    const { testId } = req.params;

    const { test, error, status } = await getPublishedFreeTest(testId);
    if (error) return res.status(status).json({ message: error });

    const sections = await Promise.all(
      SECTION_KEYS.map(async (key) => {
        const ref    = test.sections?.[key];
        const sectionStatus = ref?.status ?? "pending";

        if (sectionStatus !== "complete" || !ref?.sectionRef) {
          return {
            sectionKey:       key,
            sectionName:      SECTION_NAMES[key],
            mcqCount:         0,
            timeLimitSeconds: 0,
            subjectBreakdown: [],
            available:        false,
          };
        }

        const sec = await FreeMockSection.findById(ref.sectionRef)
          .select("totalMCQs timeLimit subjectBreakdown")
          .lean();

        // Zero-MCQ guard section exists but has no questions
        const mcqCount = sec?.totalMCQs ?? 0;

        return {
          sectionKey:       key,
          sectionName:      SECTION_NAMES[key],
          mcqCount,
          timeLimitSeconds: sec?.timeLimit ?? 0,
          subjectBreakdown: sec?.subjectBreakdown ?? [],
          available:        mcqCount > 0,
        };
      })
    );

    res.set("Cache-Control", "no-store");

    return res.json({
      _id:        test._id,
      title:      `Free Mock Test ${test.testNumber}`,
      testNumber: test.testNumber,
      sections,
    });
  } catch (err) {
    console.error("[publicTestHub] GET /free-tests/:testId →", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
