/**
 * scripts/fixMilitaryDefaults.js
 *
 * One-time fix: restores isDeletable:false + isDefault:true on the
 * 3 default military categories (Pak Army, Pak Navy, Pak Air Force).
 *
 * Why this is needed:
 *   The verbal/non-verbal auto-sharing logic in routes/adminTests.js
 *   only triggers when a category has isDeletable === false AND its
 *   slug is one of ["pak-army", "pak-navy", "pak-air-force"].
 *   There is no admin UI path that creates a category with
 *   isDeletable:false — it must be set directly in the DB. If these
 *   3 categories are ever deleted and recreated via the normal
 *   "Add Category" form, they come back with isDeletable:true and
 *   silently lose the sharing behaviour.
 *
 * Usage:  node scripts/fixMilitaryDefaults.js
 *
 * Safe to re-run any time.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/Category.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

const MILITARY_SLUGS = ["pak-army", "pak-navy", "pak-air-force"];

await mongoose.connect(MONGO_URI);
console.log("✅  Connected to MongoDB");

const found = await Category.find({ slug: { $in: MILITARY_SLUGS } });

if (found.length === 0) {
  console.error(
    "❌  No categories found matching slugs:",
    MILITARY_SLUGS.join(", "),
    "\n    Check your actual category slugs in the DB (GET /api/categories) —",
    "\n    if they differ (e.g. 'air-force' instead of 'pak-air-force'), this",
    "\n    script won't match them and the MILITARY_SLUGS constant in",
    "\n    routes/adminTests.js needs to be updated to match instead."
  );
  await mongoose.disconnect();
  process.exit(1);
}

for (const slug of MILITARY_SLUGS) {
  const match = found.find((c) => c.slug === slug);
  if (!match) {
    console.warn(`⚠️  No category found with slug "${slug}" — skipping.`);
  }
}

const result = await Category.updateMany(
  { slug: { $in: MILITARY_SLUGS } },
  { $set: { isDeletable: false, isDefault: true } }
);

console.log(`✅  Updated ${result.modifiedCount} categor${result.modifiedCount === 1 ? "y" : "ies"}.`);

const after = await Category.find({ slug: { $in: MILITARY_SLUGS } }).select(
  "name slug isDeletable isDefault"
);
console.table(after.map((c) => c.toObject()));

await mongoose.disconnect();
console.log("✅  Done. Verbal/non-verbal saves should now share across all 3 categories again.");
