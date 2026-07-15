/**
 * scripts/migrateMcqsToOwnCollection.js
 *
 * Stage 1 of the MCQ storage refactor.
 *
 * Copies embedded MCQs from Test.mcqs and FreeCustomTest.mcqs into their
 * own Mcq documents (see models/Mcq.js), and sets mcqCount on the parent
 * document to match.
 *
 * This script is READ-ONLY with respect to the original embedded `mcqs`
 * field — it never deletes or modifies it. That cleanup is a separate,
 * manual step (see scripts/cleanupMcqsEmbeddedField.js) to be run only
 * after the migration has been verified.
 *
 * Idempotent: if Mcq documents already exist for a given testId + testModel,
 * that parent document is skipped, so this script is safe to re-run if it
 * fails partway through.
 *
 * IMPORTANT: this script reads the embedded `mcqs` array directly from the
 * raw collection (via the native driver), not through the Test/FreeCustomTest
 * mongoose models, because the `mcqs` schema field has already been removed
 * from those models in this stage. Reading through the models would silently
 * strip the field.
 *
 * Usage: node scripts/migrateMcqsToOwnCollection.js
 *        (or: npm run migrate:mcqs)
 */

import "dotenv/config";
import mongoose from "mongoose";
import Mcq from "../models/Mcq.js";
import Test from "../models/Test.js";
import FreeCustomTest from "../models/FreeCustomTest.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

// Each entry pairs the mongoose model (for setting mcqCount) with the
// testModel label to stamp onto the created Mcq docs.
const TARGETS = [
  { model: Test, testModel: "Test" },
  { model: FreeCustomTest, testModel: "FreeCustomTest" },
];

async function migrateOne(rawDoc, { model, testModel }) {
  const testId = rawDoc._id;
  const embeddedMcqs = rawDoc.mcqs;

  if (!Array.isArray(embeddedMcqs) || embeddedMcqs.length === 0) {
    return "empty";
  }

  const alreadyMigrated = await Mcq.exists({ testId, testModel });
  if (alreadyMigrated) {
    return "skipped";
  }

  const mcqDocs = embeddedMcqs.map((mcq, index) => ({
    testId,
    testModel,
    question: mcq.question,
    options: mcq.options,
    correctOption: mcq.correctOption,
    order: index,
  }));

  await Mcq.insertMany(mcqDocs, { ordered: true });

  await model.updateOne(
    { _id: testId },
    { $set: { mcqCount: mcqDocs.length } }
  );

  return "migrated";
}

async function migrateCollection({ model, testModel }) {
  const summary = { migrated: 0, skipped: 0, empty: 0 };

  // Read raw documents via the native driver collection so the (now
  // schema-less) `mcqs` field still comes through even though it's been
  // removed from the mongoose schema.
  const cursor = model.collection.find(
    {},
    { projection: { mcqs: 1 } }
  );

  for await (const rawDoc of cursor) {
    const result = await migrateOne(rawDoc, { model, testModel });
    summary[result] += 1;
  }

  return summary;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  const overall = {};

  for (const target of TARGETS) {
    console.log(`\n➡️   Migrating ${target.testModel}...`);
    const summary = await migrateCollection(target);
    overall[target.testModel] = summary;
    console.log(
      `   ${target.testModel}: migrated=${summary.migrated} skipped(already migrated)=${summary.skipped} empty(no mcqs)=${summary.empty}`
    );
  }

  console.log("\n📊  Migration summary");
  for (const [testModel, summary] of Object.entries(overall)) {
    console.log(
      `   ${testModel} — migrated: ${summary.migrated}, skipped: ${summary.skipped}, empty: ${summary.empty}`
    );
  }

  await mongoose.disconnect();
  console.log("\n✅  Done.");
}

main().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});