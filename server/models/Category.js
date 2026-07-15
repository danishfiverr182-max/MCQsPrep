/**
 * models/Category.js  (updated Prompt 97   SEO fields)
 *
 * Added:
 *   - seoTitle:       String. Admin-written <title> tag for this category page.
 *   - seoDescription: String. Admin-written meta description.
 *   - blogContent:    String. HTML body content for the category page (admin only).
 */

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    // Cloudinary public_id for the cover image needed to delete/replace
    // the asset cleanly when the admin updates or removes the cover image.
    imagePublicId: { type: String, default: "" },
    isDeletable: { type: Boolean, default: true },
    // Keep isDefault for backward compat with existing categoryController.js
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    // Incremented each time a premium test in this category becomes published.
    testCount: { type: Number, default: 0 },
    // Incremented each time a Free Mock Test in this category is auto-published.
    // Separate from testCount free mock tests are counted independently.
    freeMockTestCount: { type: Number, default: 0 },

    // ── SEO fields (Prompt 97) ──────────────────────────────────
    // Admin-written <title> tag shown in Google search results.
    seoTitle: { type: String, default: "" },
    // Admin-written meta description shown under the title in search results.
    seoDescription: { type: String, default: "" },
    // HTML body content rendered on the public category page below the test list.
    // Written by admin only   not user-supplied content.
    blogContent: { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Text index on name enables $text search in Part 4+ ─────
categorySchema.index({ name: "text" });

// ── Sort index on order speeds up the default sorted query ──
categorySchema.index({ order: 1 });

// ── Pre-save hook: auto-generate slug from name ───────────────
categorySchema.pre("save", async function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
