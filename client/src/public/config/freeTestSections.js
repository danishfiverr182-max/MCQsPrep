/**
 * src/public/config/freeTestSections.js  (Part 8 Prompt 06)
 *
 * Single source of truth for the three Free Mock Test section keys.
 * These MUST exactly match:
 *   - The enum on FreeMockSection.type            (server/models/FreeMockSection.js)
 *   - The keys on FreeMockTest.sections            (server/models/FreeMockTest.js)
 *   - The :sectionKey route params used throughout server/routes/publicTestHub.js,
 *     publicTestSection.js, and publicTestSubmit.js
 *
 * Import this constant anywhere a sectionKey is compared, looped over, or
 * displayed, instead of re-typing the string literals this is what the
 * prompt means by "document it as a constant in a shared config file to
 * prevent future mismatches."
 */

export const SECTION_KEYS = ["verbal", "nonVerbal", "academic"];

export const SECTION_DISPLAY_NAMES = {
  verbal:    "Verbal",
  nonVerbal: "Non-Verbal",
  academic:  "Academic",
};

export function isValidSectionKey(key) {
  return SECTION_KEYS.includes(key);
}
