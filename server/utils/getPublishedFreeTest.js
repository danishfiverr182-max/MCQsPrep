/**
 * server/utils/getPublishedFreeTest.js  (Prompt 80)
 *
 * Shared helper used by all Part 8 public route handlers.
 * Encapsulates the isPremium:false + isPublished:true guard in one place.
 *
 * FreeMockTest documents are inherently free (not premium), so the guard
 * here is purely: exists + isPublished === true.
 *
 * Returns:
 *   { test }        on success
 *   { error, status } on validation failure or not found
 *
 * Usage:
 *   const { test, error, status } = await getPublishedFreeTest(testId);
 *   if (error) return res.status(status).json({ message: error });
 */

import mongoose     from "mongoose";
import FreeMockTest from "../models/FreeMockTest.js";

export async function getPublishedFreeTest(testId) {
  // 1. Validate ObjectId format early to avoid a Mongoose cast error
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return { error: "Test not found.", status: 404 };
  }

  // 2. Fetch the test
  const test = await FreeMockTest.findById(testId).lean();

  // 3. Not found or not published → same 404 to avoid leaking existence
  if (!test) {
    return { error: "Test not found.", status: 404 };
  }
  if (!test.isPublished) {
    return { error: "Test not found.", status: 404 };
  }

  return { test };
}
