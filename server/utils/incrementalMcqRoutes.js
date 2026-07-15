/**
 * utils/incrementalMcqRoutes.js
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Today, every keystroke in the Verbal/Non-Verbal/Academic MCQ editor
 * debounces (800ms) into a POST that resends the ENTIRE mcqs array for
 * that section — every question, every option, already-saved AND new —
 * just to persist a single changed character. On a 200+ MCQ section this
 * is the main source of the "typing lag" / server load you're seeing,
 * independent of the front-end re-render issue.
 *
 * This file adds three small, targeted routes per section type that let
 * the client save ONE MCQ, or APPEND a batch, or TRUNCATE the count,
 * without ever re-sending or rewriting MCQs that haven't changed:
 *
 *   PATCH /mcq/:testId            → update exactly one MCQ (by index)
 *   POST  /mcq-batch/:testId      → append N blank MCQs ($push)
 *   PATCH /mcq-truncate/:testId   → shrink to N MCQs ($slice)
 *
 * IMPORTANT — this does NOT change the shared-section behavior.
 * Sharing (one verbal/non-verbal Section document referenced by all three
 * default military categories) happens in the existing `.../save/:testId`
 * finalize route via `sectionRef`, which is untouched by this file. These
 * routes only change *how* the mcqs array inside that one Section document
 * gets updated — a single write still updates the single shared document,
 * so all three categories still see the change immediately, exactly as
 * today. You do not need to give up the auto-share behavior to get this
 * performance fix.
 *
 * Usage:
 *   import { registerIncrementalMcqRoutes } from "../utils/incrementalMcqRoutes.js";
 *   registerIncrementalMcqRoutes(router, {
 *     TestModel: Test,
 *     SectionModel: Section,
 *     basePath: "/sections",        // final paths: /sections/:urlType/mcq/:testId etc.
 *     types: { verbal: "verbal", nonVerbal: "nonVerbal", academic: "academic" },
 *     authMiddleware: verifyAdmin,   // or omit if router already has router.use(verifyAdmin)
 *   });
 */

function blankMcq() {
  return {
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
    imageUrl: "",
    imagePublicId: "",
  };
}

function sanitiseSingleMcq(m) {
  return {
    question: typeof m?.question === "string" ? m.question.trim() : "",
    options: [0, 1, 2, 3].map((i) => String(m?.options?.[i] ?? "")),
    correctIndex:
      typeof m?.correctIndex === "number" && m.correctIndex >= 0 ? m.correctIndex : 0,
    explanation: m?.explanation || "",
    imageUrl: m?.imageUrl || "",
    imagePublicId: m?.imagePublicId || "",
  };
}

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/**
 * @param router          express.Router() to attach routes to
 * @param TestModel       mongoose model that owns `sections.<field>.sectionRef` (Test or FreeMockTest)
 * @param SectionModel     mongoose model for the section documents (Section or FreeMockSection)
 * @param basePath        e.g. "/sections" (premium) — final route is `${basePath}/:urlType/mcq/:testId`
 * @param types           map of { urlSegment: dbFieldName }, e.g. { verbal: "verbal", nonverbal: "nonVerbal", academic: "academic" }
 * @param authMiddleware  optional per-route middleware (omit if router already applies auth globally)
 */
export function registerIncrementalMcqRoutes(
  router,
  { TestModel, SectionModel, basePath, types, authMiddleware }
) {
  const mw = authMiddleware ? [authMiddleware] : [];
  const urlSegments = Object.keys(types);

  function resolveType(urlType) {
    return types[urlType] || null;
  }

  // ── PATCH .../:urlType/mcq/:testId ───────────────────────────
  // Update exactly one MCQ in place. Cost is O(1) regardless of how many
  // MCQs the section already has — no other MCQ is read or rewritten.
  router.patch(`${basePath}/:urlType/mcq/:testId`, ...mw, async (req, res) => {
    try {
      const { urlType, testId } = req.params;
      const dbType = resolveType(urlType);
      if (!dbType) return res.status(400).json({ message: "Invalid section type." });
      if (!OBJECT_ID_RE.test(testId)) {
        return res.status(400).json({ message: "Invalid test ID format." });
      }

      const { index, mcq } = req.body ?? {};
      if (typeof index !== "number" || index < 0) {
        return res.status(400).json({ message: "A valid MCQ index is required." });
      }
      if (!mcq || typeof mcq !== "object") {
        return res.status(400).json({ message: "mcq payload is required." });
      }

      const test = await TestModel.findById(testId).select("sections");
      if (!test) return res.status(404).json({ message: "Test not found." });

      const sectionRef = test.sections?.[dbType]?.sectionRef;
      if (!sectionRef) {
        return res.status(400).json({
          message: "No draft section found yet. Save the section settings before editing MCQs.",
        });
      }

      const sanitised = sanitiseSingleMcq(mcq);
      const result = await SectionModel.updateOne(
        { _id: sectionRef, [`mcqs.${index}`]: { $exists: true } },
        { $set: { [`mcqs.${index}`]: sanitised } }
      );

      if (result.matchedCount === 0) {
        return res.status(400).json({
          message: `MCQ #${index + 1} does not exist yet — add it via a batch first.`,
        });
      }

      return res.status(200).json({ saved: true });
    } catch (err) {
      console.error(`PATCH ${basePath}/:urlType/mcq/:testId error:`, err.message);
      return res.status(500).json({ message: "Server error." });
    }
  });

  // ── POST .../:urlType/mcq-batch/:testId ──────────────────────
  // Append `count` blank MCQ placeholders via $push. Creates the section
  // document on the first call (mirrors the old .../draft "create" path).
  router.post(`${basePath}/:urlType/mcq-batch/:testId`, ...mw, async (req, res) => {
    try {
      const { urlType, testId } = req.params;
      const dbType = resolveType(urlType);
      if (!dbType) return res.status(400).json({ message: "Invalid section type." });
      if (!OBJECT_ID_RE.test(testId)) {
        return res.status(400).json({ message: "Invalid test ID format." });
      }

      const { count, timeLimit, totalMCQs } = req.body ?? {};
      const n = parseInt(count, 10);
      if (!n || n < 1) {
        return res.status(400).json({ message: "count must be at least 1." });
      }

      const test = await TestModel.findById(testId);
      if (!test) return res.status(404).json({ message: "Test not found." });

      const batch = Array.from({ length: n }, blankMcq);
      let sectionRef = test.sections?.[dbType]?.sectionRef;
      let section = null;

      if (sectionRef) {
        section = await SectionModel.findByIdAndUpdate(
          sectionRef,
          { $push: { mcqs: { $each: batch } } },
          { new: true, runValidators: false }
        );
      }

      if (!section) {
        if (timeLimit === undefined || Number(timeLimit) < 60) {
          return res
            .status(400)
            .json({ message: "timeLimit (>= 60s) is required to create the section." });
        }
        section = await SectionModel.create({
          type: dbType,
          category: test.category,
          timeLimit: Number(timeLimit),
          totalMCQs: Number(totalMCQs) || n,
          mcqs: batch,
        });
        test.sections[dbType].sectionRef = section._id;
        await test.save();
      }

      return res.status(200).json({ sectionId: section._id, mcqCount: section.mcqs.length });
    } catch (err) {
      console.error(`POST ${basePath}/:urlType/mcq-batch/:testId error:`, err.message);
      return res.status(500).json({ message: "Server error." });
    }
  });

  // ── PATCH .../:urlType/mcq-truncate/:testId ──────────────────
  // Shrink the mcqs array to `count` items via $slice, used when the admin
  // reduces the target MCQ count after already adding containers.
  router.patch(`${basePath}/:urlType/mcq-truncate/:testId`, ...mw, async (req, res) => {
    try {
      const { urlType, testId } = req.params;
      const dbType = resolveType(urlType);
      if (!dbType) return res.status(400).json({ message: "Invalid section type." });

      const { count } = req.body ?? {};
      const n = parseInt(count, 10);
      if (isNaN(n) || n < 0) {
        return res.status(400).json({ message: "A valid count is required." });
      }

      const test = await TestModel.findById(testId).select("sections");
      if (!test) return res.status(404).json({ message: "Test not found." });

      const sectionRef = test.sections?.[dbType]?.sectionRef;
      if (!sectionRef) return res.status(200).json({ saved: true }); // nothing to truncate yet

      await SectionModel.updateOne({ _id: sectionRef }, [
        { $set: { mcqs: { $slice: ["$mcqs", n] }, totalMCQs: n } },
      ]);

      return res.status(200).json({ saved: true });
    } catch (err) {
      console.error(`PATCH ${basePath}/:urlType/mcq-truncate/:testId error:`, err.message);
      return res.status(500).json({ message: "Server error." });
    }
  });

  return { urlSegments };
}
