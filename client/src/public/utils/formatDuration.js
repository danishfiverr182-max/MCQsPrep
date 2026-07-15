/**
 * src/public/utils/formatDuration.js  (Part 8 Prompt 03)
 *
 * Converts a duration in seconds to a HH:MM:SS string.
 *
 * Examples:
 *   formatDuration(0)    → "00:00:00"
 *   formatDuration(60)   → "00:01:00"
 *   formatDuration(1800) → "00:30:00"
 *   formatDuration(3661) → "01:01:01"
 */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}
