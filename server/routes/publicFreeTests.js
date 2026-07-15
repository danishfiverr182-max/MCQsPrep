/**
 * routes/publicFreeTests.js  (Prompt 80 hardened)
 *
 * Changes vs Prompt 68:
 *   - Error response message standardised to "Server error. Please try again."
 *     (consistent JSON, never HTML stack trace).
 *
 * GET /api/free-tests
 *   Public no auth required.
 *   Returns all published FreeMockTests grouped by category.
 */

import { Router }      from "express";
import Category        from "../models/Category.js";
import FreeMockTest    from "../models/FreeMockTest.js";
import FreeMockSection from "../models/FreeMockSection.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find({})
      .select("_id name slug")
      .sort({ createdAt: 1 })
      .lean();

    if (!categories.length) return res.json([]);

    const grouped = await Promise.all(
      categories.map(async (cat) => {
        const tests = await FreeMockTest.find({
          category:    cat._id,
          isPublished: true,
        })
          .sort({ testNumber: 1 })
          .lean();

        if (!tests.length) return null;

        const testsWithCounts = await Promise.all(
          tests.map(async (test) => {
            async function sectionMCQs(sectionRef) {
              if (!sectionRef) return 0;
              const sec = await FreeMockSection.findById(sectionRef)
                .select("totalMCQs")
                .lean();
              return sec?.totalMCQs ?? 0;
            }

            const [verbalMCQs, nonVerbalMCQs, academicMCQs] = await Promise.all([
              sectionMCQs(test.sections?.verbal?.sectionRef),
              sectionMCQs(test.sections?.nonVerbal?.sectionRef),
              sectionMCQs(test.sections?.academic?.sectionRef),
            ]);

            return {
              _id:        test._id,
              testNumber: test.testNumber,
              title:      `Free Mock Test ${test.testNumber}`,
              totalMCQs:  verbalMCQs + nonVerbalMCQs + academicMCQs,
              sections: {
                verbal:    { status: test.sections?.verbal?.status    ?? "pending" },
                nonVerbal: { status: test.sections?.nonVerbal?.status ?? "pending" },
                academic:  { status: test.sections?.academic?.status  ?? "pending" },
              },
            };
          })
        );

        return {
          categoryName: cat.name,
          categorySlug: cat.slug,
          tests:        testsWithCounts,
        };
      })
    );

    const result = grouped.filter(Boolean);

    res.set("Cache-Control", "no-store");
    return res.json(result);
  } catch (err) {
    console.error("[publicFreeTests] GET /free-tests →", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
