/**
 * models/FreeMockTest.js  (Part 5 Prompt 01)
 *
 * FreeMockTest belongs to a single Category.
 * Unlike premium Tests, Free Mock Tests are NEVER shared across categories.
 * Each category gets its own completely independent MCQs for all three sections.
 *
 * Compound unique index on { category, testNumber } prevents duplicate test
 * numbers within the same category.
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ── Sub-schema for a single section reference ─────────────────
const sectionRefSchema = new Schema(
  {
    status:     { type: String, enum: ["pending", "complete"], default: "pending" },
    sectionRef: { type: Schema.Types.ObjectId, ref: "FreeMockSection", default: null },
  },
  { _id: false }
);

// ── FreeMockTest schema ───────────────────────────────────────
const freeMockTestSchema = new Schema(
  {
    category: {
      type:     Schema.Types.ObjectId,
      ref:      "Category",
      required: true,
    },

    // Auto-incremented per category (1, 2, 3 …)
    testNumber: {
      type:     Number,
      required: true,
    },

    sections: {
      verbal:    { type: sectionRefSchema, default: () => ({}) },
      nonVerbal: { type: sectionRefSchema, default: () => ({}) },
      academic:  { type: sectionRefSchema, default: () => ({}) },
    },

    // Prompt 13 — explicit flags so free tests can be told apart from premium
    // tests, and 3-section (default category) tests from single-section
    // (custom category) tests, without relying on which model was queried.
    isFree:       { type: Boolean, default: true },
    isStandalone: { type: Boolean, default: false },

    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Compound unique index: one testNumber per category ────────
freeMockTestSchema.index({ category: 1, testNumber: 1 }, { unique: true });

export default model("FreeMockTest", freeMockTestSchema);
