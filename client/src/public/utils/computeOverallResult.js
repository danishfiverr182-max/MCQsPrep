/**
 * src/public/utils/computeOverallResult.js
 *
 * Pure utility no side effects, no React, no localStorage.
 *
 * Accepts the `results` object keyed by sectionKey, where each value is
 * a result object: { score: Number, total: Number, passed: Boolean }
 *
 * Pass rule (spec 8.8): ALL sections must have passed === true.
 * A single section below 50% fails the whole test regardless of others.
 *
 * @param {Object} results  e.g. { verbal: {...}, nonVerbal: {...}, academic: {...} }
 * @param {Array}  sections Array of section objects from the API (for display names)
 * @returns {{ overallPassed: boolean, failedSections: Array<{sectionKey, sectionName}> }}
 */
export function computeOverallResult(results, sections) {
  const failedSections = sections.filter((s) => {
    const r = results[s.sectionKey];
    return !r || r.passed !== true;
  });

  const overallPassed = failedSections.length === 0;

  return { overallPassed, failedSections };
}
