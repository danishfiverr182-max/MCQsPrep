/**
 * routes/publicTestSubmit.js  (Prompt 80 hardened)
 *
 * Changes vs Prompt 08:
 *   - Uses shared getPublishedFreeTest() helper.
 *   - Input validation: if req.body.answers is missing or not an object,
 *     returns 400 { message: 'Answers are required.' } immediately.
 *
 * POST /api/free-tests/:testId/section/:sectionKey/submit
 */

import { Router }      from "express";
import FreeMockSection from "../models/FreeMockSection.js";
import { SECTION_KEYS } from "../config/freeTestSections.js";
import { getPublishedFreeTest } from "../utils/getPublishedFreeTest.js";

const router = Router();

router.post("/:testId/section/:sectionKey/submit", async (req, res) => {
  try {
    const { testId, sectionKey } = req.params;
    const { answers } = req.body || {};

    // ── Input validation ──────────────────────────────────────
    // answers must be present and a plain object (not array, not null)
    if (
      answers === undefined ||
      answers === null ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({ message: "Answers are required." });
    }

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

    // Load the section WITH correctIndex for grading
    const section = await FreeMockSection.findById(sectionMeta.sectionRef)
      .select("mcqs")
      .lean();

    if (!section) {
      return res.status(404).json({ message: "Section not found." });
    }

    const mcqs  = section.mcqs ?? [];
    const total = mcqs.length;

    let score = 0;
    for (const mcq of mcqs) {
      const submitted = answers[mcq._id.toString()];
      if (typeof submitted === "number" && submitted === mcq.correctIndex) {
        score += 1;
      }
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed      = percentage >= 50;

    res.set("Cache-Control", "no-store");

    return res.json({ score, total, percentage, passed });
  } catch (err) {
    console.error("[publicTestSubmit] POST submit →", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
