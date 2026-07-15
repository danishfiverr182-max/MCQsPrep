/**
 * routes/publicTests.js  (updated Part 9   Prompt 5)
 *
 * Changes from previous version:
 *  - optionalUser middleware applied to GET /category/:slug so logged-in
 *    users receive hasAccess and userExpired in the category envelope.
 *  - The tests array shape is unchanged   actual MCQ content is never
 *    returned here; it is fetched separately in Prompt 7 behind verifyUser
 *    + hasAccessTo so the gate is enforced at fetch time, not list time.
 *  - GET /:testId is unchanged (no auth context needed for hub metadata).
 *
 * Response shape for GET /api/tests/category/:slug:
 *   Anonymous:
 *     { category: { name, slug }, tests: [...] }
 *   Logged in:
 *     { category: { name, slug, hasAccess, userExpired }, tests: [...] }
 */

import { Router }    from "express";
import mongoose      from "mongoose";
import Test          from "../models/Test.js";
import Section       from "../models/Section.js";
import Category      from "../models/Category.js";
import { optionalUser } from "../middleware/optionalUser.js";

const router = Router();

/**
 * GET /api/tests/category/:slug
 *
 * Returns all published tests for a category (by slug).
 * Used by the user-facing CategoryPage.
 */
router.get("/category/:slug", optionalUser, async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).lean();
    if (!category) return res.status(404).json({ message: "Category not found." });

    const tests = await Test.find({ category: category._id, isPublished: true })
      .sort({ testNumber: 1 })
      .lean();

    const shaped = tests.map((t) => ({
      _id:        t._id,
      testNumber: t.testNumber,
      title:      `Test ${t.testNumber}`,
      sections: {
        verbal:    t.sections?.verbal?.status    === "complete" ? "ready" : "pending",
        nonVerbal: t.sections?.nonVerbal?.status === "complete" ? "ready" : "pending",
        academic:  t.sections?.academic?.status  === "complete" ? "ready" : "pending",
      },
    }));

    // Build category envelope   add access flags when a user is logged in
    const categoryEnvelope = {
      name: category.name,
      slug: category.slug,
      isDefault: category.isDefault === true,
      description: category.description || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      blogContent: category.blogContent || "",
    };

    if (req.user) {
      categoryEnvelope.hasAccess   = req.user.hasAccessTo(category.slug);
      categoryEnvelope.userExpired = req.user.isExpired();
    }

    // No-store because the response is personalised when a cookie is present
    res.set("Cache-Control", "no-store");

    return res.json({ category: categoryEnvelope, tests: shaped });
  } catch (err) {
    console.error("GET /api/tests/category/:slug error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * GET /api/tests/:testId
 *
 * Returns hub metadata for a single published category test.
 * Used by pages/user/TestHubPage.jsx at route /test/:testId.
 * No auth context needed here   access gating happens in Prompt 7.
 *
 * Response shape:
 * {
 *   _id, title, testNumber,
 *   category: { name, slug },
 *   sections: [
 *     { sectionKey, sectionName, mcqCount, timeLimitSeconds, available }
 *   ]
 * }
 */
router.get("/:testId", async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(404).json({ message: "Test not found." });
    }

    const test = await Test.findById(testId).populate("category", "name slug").lean();

    if (!test)             return res.status(404).json({ message: "Test not found." });
    if (!test.isPublished) return res.status(404).json({ message: "Test not found." });

    const SECTION_KEYS  = ["verbal", "nonVerbal", "academic"];
    const SECTION_NAMES = { verbal: "Verbal", nonVerbal: "Non-Verbal", academic: "Academic" };

    const sections = await Promise.all(
      SECTION_KEYS.map(async (key) => {
        const slot   = test.sections?.[key];
        const status = slot?.status ?? "pending";

        if (status !== "complete" || !slot?.sectionRef) {
          return {
            sectionKey:       key,
            sectionName:      SECTION_NAMES[key],
            mcqCount:         0,
            timeLimitSeconds: 0,
            subjectBreakdown: [],
            available:        false,
          };
        }

        const sec = await Section.findById(slot.sectionRef)
          .select("totalMCQs timeLimit subjectBreakdown")
          .lean();

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
      title:      `Test ${test.testNumber}`,
      testNumber: test.testNumber,
      category: {
        name: test.category?.name ?? "",
        slug: test.category?.slug ?? "",
      },
      sections,
    });
  } catch (err) {
    console.error("GET /api/tests/:testId error:", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
