import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { body, validationResult } from "express-validator";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import Category from "../models/Category.js";
import Test from "../models/Test.js";
import Section from "../models/Section.js";
import PremiumUser from "../models/PremiumUser.js";
import TestGroup from "../models/TestGroup.js";
import FreeMockTest from "../models/FreeMockTest.js";
import FreeMockSection from "../models/FreeMockSection.js";
import FreeCustomTest from "../models/FreeCustomTest.js";
import Mcq from "../models/Mcq.js";
import cloudinary from "../config/cloudinary.js";

const router = Router();

// ── Multer memory storage for Cloudinary uploads ────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap for cover images
});

// ── GET /api/admin/categories ─────────────────────────────────
router.get("/", verifyAdmin, async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const categories = await Category.find().sort({ order: 1 });
    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toObject(),
      testCount: 0,
    }));
    return res.json(categoriesWithCount);
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/admin/categories/upload-cover ───────────────────
//
// Accepts a multipart image upload, sends it to Cloudinary, and returns
// the secure URL and public_id. Used by the Add/Edit Category forms to
// upload a cover image *before* creating/updating the category document
// (so the create/update request itself stays plain JSON).
//
// Body: multipart/form-data with field name "image"
// Response: { url, publicId }
router.post(
  "/upload-cover",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
      }

      const b64     = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder:          "category-covers",
        resource_type:   "image",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      });

      return res.status(200).json({
        url:      result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("POST /api/admin/categories/upload-cover error:", err.message);
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }
  }
);

// ── POST /api/admin/categories ────────────────────────────────
router.post(
  "/",
  verifyAdmin,
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required.")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters.")
    .isLength({ max: 80 }).withMessage("Name must be 80 characters or fewer."),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 }).withMessage("Description must be 300 characters or fewer."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg });
    }

    const { name, description, image, imagePublicId } = req.body;

    try {
      const last = await Category.findOne().sort({ order: -1 }).select("order");
      const nextOrder = last ? last.order + 1 : 0;

      const category = new Category({
        name,
        description: description?.trim() || "",
        image:        image || "",
        imagePublicId: imagePublicId || "",
        isDeletable: true,
        order: nextOrder,
      });

      await category.save();
      return res.status(201).json({ ...category.toObject(), testCount: 0 });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "A category with this name already exists." });
      }
      console.error("POST /api/admin/categories error:", err);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

// ── PATCH /api/admin/categories/:slug ─────────────────────────
//
// Updates a category's description and/or cover image. Name/slug are
// intentionally immutable here to avoid breaking existing test/category
// links only description, image, and imagePublicId can change.
//
// Body: { description?, image?, imagePublicId? }
// If a new image is provided and an old imagePublicId exists, the old
// Cloudinary asset is destroyed so unused covers don't pile up.
router.patch(
  "/:slug",
  verifyAdmin,
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 }).withMessage("Description must be 300 characters or fewer."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg });
    }

    try {
      const category = await Category.findOne({ slug: req.params.slug });
      if (!category) {
        return res.status(404).json({ message: "Category not found." });
      }

      const { description, image, imagePublicId, seoTitle, seoDescription, blogContent } = req.body;

      // If replacing the cover image, clean up the old Cloudinary asset.
      if (image !== undefined && category.imagePublicId && category.imagePublicId !== imagePublicId) {
        try {
          await cloudinary.uploader.destroy(category.imagePublicId);
        } catch (cleanupErr) {
          console.error(
            `PATCH /api/admin/categories/${req.params.slug} Cloudinary cleanup failed:`,
            cleanupErr.message
          );
          // Non-fatal continue with the update regardless.
        }
      }

      if (description !== undefined) category.description = description.trim();
      if (image !== undefined) category.image = image;
      if (imagePublicId !== undefined) category.imagePublicId = imagePublicId;

      // ── SEO fields (Prompt 97) ──────────────────────────────
      if (seoTitle !== undefined) category.seoTitle = seoTitle.trim();
      if (seoDescription !== undefined) category.seoDescription = seoDescription.trim();
      // blogContent is admin-written HTML   stored as-is
      if (blogContent !== undefined) category.blogContent = blogContent;

      await category.save();
      return res.json({ ...category.toObject(), testCount: 0 });
    } catch (err) {
      console.error(`PATCH /api/admin/categories/${req.params.slug} error:`, err.message);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

// ── PATCH /api/admin/categories/reorder ───────────────────────
// Accepts { order: [{ slug, order }, ...] } custom categories only.
// Default categories (isDeletable: false) are immutable and protected.
// Uses Promise.all to bulk-update all order fields in parallel.
router.patch("/reorder", verifyAdmin, async (req, res) => {
  const { order } = req.body;

  // Basic shape validation
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(422).json({ message: "order must be a non-empty array." });
  }

  for (const item of order) {
    if (typeof item.slug !== "string" || typeof item.order !== "number") {
      return res
        .status(422)
        .json({ message: "Each item must have a string slug and a numeric order." });
    }
  }

  try {
    // Guard: none of the slugs may belong to a default (locked) category
    const slugs = order.map((item) => item.slug);
    const lockedMatches = await Category.find({
      slug: { $in: slugs },
      isDeletable: false,
    }).select("slug");

    if (lockedMatches.length > 0) {
      const locked = lockedMatches.map((c) => c.slug).join(", ");
      return res.status(403).json({
        message: `Default categories cannot be reordered: ${locked}`,
      });
    }

    // Bulk-update in parallel last-write-wins is fine here since the
    // client sends the full new order in a single request.
    await Promise.all(
      order.map(({ slug, order: newOrder }) =>
        Category.updateOne({ slug }, { $set: { order: newOrder } })
      )
    );

    return res.json({ message: "Order updated" });
  } catch (err) {
    console.error("PATCH /api/admin/categories/reorder error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/admin/categories/:slug ───────────────────────────
router.get("/:slug", verifyAdmin, async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ ...category.toObject(), testCount: 0 });
  } catch (err) {
    console.error("GET /api/admin/categories/:slug error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/admin/categories/:slug/tests ─────────────────────
//
// Returns real Test documents for a category (both published and
// in-progress), newest first, with section status/totalMCQs/timeLimit
// populated from their linked Section documents.
//
// Query params: ?page=1&limit=10
// Response: { category, tests, total, page, totalPages }
router.get("/:slug/tests", verifyAdmin, async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ── Pagination params ─────────────────────────────────────
    const page  = Math.max(parseInt(req.query.page, 10)  || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip  = (page - 1) * limit;

    const filter = { category: category._id };

    const categoryPayload = {
      name: category.name,
      slug: category.slug,
      isDeletable: category.isDeletable,
      isDefault: category.isDefault,
      description: category.description || "",
      image: category.image || "",
      imagePublicId: category.imagePublicId || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      blogContent: category.blogContent || "",
    };

    // ── Custom categories: standalone tests grouped via TestGroup ──────
    // These tests don't use the verbal/nonVerbal/academic split — they are
    // single-section tests with MCQs stored in their own collection, tracked
    // via `status`, `mcqCount`, `totalMcqs`, `timeLimitSeconds`, and `groupId`.
    if (!category.isDefault) {
      const [total, testDocs] = await Promise.all([
        Test.countDocuments({ ...filter, isStandalone: true }),
        Test.find({ ...filter, isStandalone: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("groupId", "name slug"),
      ]);

      const tests = testDocs.map((t) => ({
        _id:              t._id,
        testNumber:       t.testNumber,
        status:           t.status,
        isPublished:      t.status === "published",
        createdAt:        t.createdAt,
        mcqCount:         t.mcqCount,
        totalMcqs:        t.totalMcqs,
        timeLimitSeconds: t.timeLimitSeconds,
        groupId:          t.groupId?._id ?? null,
        groupName:        t.groupId?.name ?? "Ungrouped",
        groupSlug:        t.groupId?.slug ?? null,
      }));

      return res.json({
        category: categoryPayload,
        tests,
        total,
        page,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      });
    }

    // ── Default categories (Army, Navy, Air Force): verbal/nonVerbal/academic ──
    const [total, testDocs] = await Promise.all([
      Test.countDocuments(filter),
      Test.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sections.verbal.sectionRef", "totalMCQs timeLimit")
        .populate("sections.nonVerbal.sectionRef", "totalMCQs timeLimit")
        .populate("sections.academic.sectionRef", "totalMCQs timeLimit"),
    ]);

    const tests = testDocs.map((t) => ({
      _id:         t._id,
      testNumber:  t.testNumber,
      isPublished: t.isPublished,
      createdAt:   t.createdAt,
      sections: {
        verbal: {
          status:    t.sections.verbal.status,
          totalMCQs: t.sections.verbal.sectionRef?.totalMCQs ?? null,
          timeLimit: t.sections.verbal.sectionRef?.timeLimit ?? null,
        },
        nonVerbal: {
          status:    t.sections.nonVerbal.status,
          totalMCQs: t.sections.nonVerbal.sectionRef?.totalMCQs ?? null,
          timeLimit: t.sections.nonVerbal.sectionRef?.timeLimit ?? null,
        },
        academic: {
          status:    t.sections.academic.status,
          totalMCQs: t.sections.academic.sectionRef?.totalMCQs ?? null,
          timeLimit: t.sections.academic.sectionRef?.timeLimit ?? null,
        },
      },
    }));

    return res.json({
      category: categoryPayload,
      tests,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    console.error("GET /api/admin/categories/:slug/tests error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── DELETE /api/admin/categories/:slug  (cascade delete) ────────
//
// Deletes a category along with EVERYTHING that belongs to it. Custom
// categories can hold several kinds of documents across separate
// collections, so this cleans up all of them:
//   1. Every Test document for the category (both default 3-section tests
//      and standalone custom tests) + their Section documents (respecting
//      isShared) + Cloudinary images + Mcq documents (standalone tests only).
//   2. Every FreeCustomTest document for the category (free tests on a
//      custom category) + their Mcq documents.
//   3. Every TestGroup document for the category (the group→test structure
//      custom categories use) — without this, groups were left orphaned
//      forever, still pointing at a deleted category.
//
// Runs inside a single MongoDB transaction. Default categories
// (isDeletable: false) are rejected with 403 — backend enforcement
// independent of the frontend hiding the delete button. (Default
// categories never have TestGroup/FreeCustomTest documents, so those
// two collections are only ever touched for custom categories here.)
router.delete("/:slug", verifyAdmin, async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    if (!category.isDeletable) {
      return res.status(403).json({
        message: "Default categories (Army, Navy, Air Force) cannot be deleted.",
      });
    }

    const tests = await Test.find({ category: category._id });
    const freeCustomTests = await FreeCustomTest.find({ category: category._id });
    const testGroups = await TestGroup.find({ category: category._id });

    // ── Section documents referenced by Test docs (shared-aware) ──────
    const sectionRefs = [];
    for (const t of tests) {
      if (t.sections.verbal.sectionRef) sectionRefs.push(t.sections.verbal.sectionRef);
      if (t.sections.nonVerbal.sectionRef) sectionRefs.push(t.sections.nonVerbal.sectionRef);
      if (t.sections.academic.sectionRef) sectionRefs.push(t.sections.academic.sectionRef);
    }
    const uniqueSectionIds = [...new Set(sectionRefs.map((id) => String(id)))];

    const sections = uniqueSectionIds.length
      ? await Section.find({ _id: { $in: uniqueSectionIds } })
      : [];

    const sectionsToDelete = [];
    for (const section of sections) {
      if (!section.isShared) {
        sectionsToDelete.push(section);
        continue;
      }
      const testIdsInThisCategory = tests.map((t) => t._id);
      const stillUsedElsewhere = await Test.exists({
        _id: { $nin: testIdsInThisCategory },
        $or: [
          { "sections.verbal.sectionRef": section._id },
          { "sections.nonVerbal.sectionRef": section._id },
          { "sections.academic.sectionRef": section._id },
        ],
      });
      if (!stillUsedElsewhere) sectionsToDelete.push(section);
    }

    const imagePublicIds = sectionsToDelete
      .filter((s) => s.type === "nonVerbal")
      .flatMap((s) => s.mcqs.map((m) => m.imagePublicId).filter(Boolean));

    if (imagePublicIds.length > 0) {
      const results = await Promise.allSettled(
        imagePublicIds.map((id) => cloudinary.uploader.destroy(id))
      );
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(
            `DELETE /api/admin/categories/:slug Cloudinary destroy failed for "${imagePublicIds[i]}":`,
            r.reason?.message || r.reason
          );
        }
      });
    }

    // ── Mcq documents for standalone tests (Test model) and free
    //    custom tests (FreeCustomTest model) — separate collection,
    //    never touched by the Section cleanup above.
    const standaloneTestIds = tests.filter((t) => t.isStandalone).map((t) => t._id);
    const freeCustomTestIds = freeCustomTests.map((t) => t._id);

    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        if (sectionsToDelete.length > 0) {
          await Section.deleteMany(
            { _id: { $in: sectionsToDelete.map((s) => s._id) } },
            { session: mongoSession }
          );
        }

        if (standaloneTestIds.length > 0) {
          await Mcq.deleteMany(
            { testId: { $in: standaloneTestIds }, testModel: "Test" },
            { session: mongoSession }
          );
        }

        if (freeCustomTestIds.length > 0) {
          await Mcq.deleteMany(
            { testId: { $in: freeCustomTestIds }, testModel: "FreeCustomTest" },
            { session: mongoSession }
          );
        }

        if (tests.length > 0) {
          await Test.deleteMany(
            { _id: { $in: tests.map((t) => t._id) } },
            { session: mongoSession }
          );
        }

        if (freeCustomTestIds.length > 0) {
          await FreeCustomTest.deleteMany(
            { _id: { $in: freeCustomTestIds } },
            { session: mongoSession }
          );
        }

        if (testGroups.length > 0) {
          await TestGroup.deleteMany(
            { _id: { $in: testGroups.map((g) => g._id) } },
            { session: mongoSession }
          );
        }

        await Category.deleteOne({ _id: category._id }, { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    return res.json({ message: "Category deleted." });
  } catch (err) {
    console.error("DELETE /api/admin/categories/:slug error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
