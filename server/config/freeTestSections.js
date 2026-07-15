/**
 * config/freeTestSections.js  (Part 8 Prompt 06)
 *
 * Single source of truth for the three Free Mock Test section keys.
 * Mirrors src/public/config/freeTestSections.js on the client.
 *
 * Used by: publicTestHub.js, publicTestSection.js, publicTestSubmit.js
 * (and any future route that needs to validate/iterate sectionKey).
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
