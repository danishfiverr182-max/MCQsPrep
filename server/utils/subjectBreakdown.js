/**
 * utils/subjectBreakdown.js
 *
 * Shared sanitizer for the admin-entered "subject % breakdown" field used
 * across all four test types (default category sections, custom category
 * standalone tests, and their free counterparts). Purely informational —
 * shown to the user on the Start Test popup so they know the subject mix
 * before committing. Intentionally NOT validated to sum to 100 here; the
 * admin UI shows a live total and warns, but a partial/rough breakdown is
 * still allowed to save.
 *
 * @param {Array} input - raw array of { subject, percentage } from req.body
 * @returns {Array<{ subject: string, percentage: number }>}
 */
export function sanitiseSubjectBreakdown(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((row) => row && typeof row.subject === "string" && row.subject.trim().length > 0)
    .map((row) => ({
      subject: row.subject.trim(),
      percentage: Math.max(0, Math.min(100, Number(row.percentage) || 0)),
    }));
}
