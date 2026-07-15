/**
 * scripts/cleanupMcqsEmbeddedField.js
 *
 * Stage 1 of the MCQ storage refactor — manual cleanup step.
 *
 * $unsets the legacy embedded `mcqs` field from every Test and
 * FreeCustomTest document, now that MCQs live in their own collection
 * (see models/Mcq.js) and mcqCount has been populated by
 * scripts/migrateMcqsToOwnCollection.js.
 *
 * ⚠️  Run this ONLY after verifying the migration — e.g. confirming
 * mcqCount on each parent document matches Mcq.countDocuments({ testId }).
 * This script is intentionally NOT called automatically by the migration
 * script.
 *
 * Usage: node scripts/cleanupMcqsEmbeddedField.js
 *        (or: npm run cleanup:mcqs)
 */

import "dotenv/config";
import mongoose from "mongoose";
import Test from "../models/Test.js";
import FreeCustomTest from "../models/FreeCustomTest.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

const TARGETS = [
  { model: Test, label: "Test" },
  { model: FreeCustomTest, label: "FreeCustomTest" },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  for (const { model, label } of TARGETS) {
    // Use the native collection so this works regardless of whether `mcqs`
    // is still declared on the mongoose schema.
    const result = await model.collection.updateMany(
      { mcqs: { $exists: true } },
      { $unset: { mcqs: "" } }
    );
    console.log(
      `   ${label}: matched=${result.matchedCount} modified=${result.modifiedCount}`
    );
  }

  await mongoose.disconnect();
  console.log("\n✅  Done.");
}

main().catch((err) => {
  console.error("❌  Cleanup failed:", err);
  process.exit(1);
});