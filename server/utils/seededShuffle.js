/**
 * utils/seededShuffle.js
 *
 * Deterministic (seeded) Fisher-Yates shuffle.
 *
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────
 * Shared verbal/non-verbal sections (Section.isShared === true) are the
 * SAME MongoDB document referenced by Pak Army, Pak Navy, and Pak Air
 * Force test slots (see routes/adminTests.js sharing transaction).
 * That means `section.mcqs` is literally identical content — same
 * questions, same array order — no matter which category/test loads it.
 *
 * Previously the MCQ list was shuffled with Math.random() on every
 * request. That's non-deterministic (order changes on every reload,
 * which is jarring mid-attempt and makes review numbering drift), and
 * — more importantly — it does nothing to make two DIFFERENT tests
 * (e.g. Army Test 3 vs Navy Test 7) that share the same underlying
 * Section feel different from one another in a *stable* way, because
 * every load re-rolls independently.
 *
 * seededShuffle() instead derives its randomness from a stable key
 * (typically `${testId}:${sectionKey}`). Because every Test document
 * has its own unique _id even when it points at a shared Section:
 *   - Army Test 3 and Navy Test 7 always render the SAME pool of
 *     questions in two DIFFERENT, stable orders.
 *   - The same test always renders the same order on every visit
 *     (resume, refresh, review) — no more drifting numbering.
 *   - A user bouncing between categories keeps running into a
 *     re-ordered set of questions instead of the exact same sequence,
 *     so it doesn't feel like "the same test again".
 *
 * This is pure ordering — it does not duplicate or invent MCQ content.
 * The admin still writes each question exactly once.
 */

// ── 32-bit string hash (xfnv1a) → used to derive the PRNG seed ────
function xfnv1a(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ── mulberry32 PRNG small, fast, good-enough distribution for this ──
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * seededShuffle(arr, seedKey)
 *
 * Returns a NEW array containing the same elements as `arr`, shuffled
 * deterministically based on `seedKey`. Same array + same seedKey will
 * always produce the same order; different seedKey → different order.
 *
 * @param {Array}  arr      - array to shuffle (not mutated)
 * @param {string} seedKey  - stable key, e.g. `${testId}:${sectionKey}`
 * @returns {Array} shuffled copy
 */
export function seededShuffle(arr, seedKey) {
  const rand = mulberry32(xfnv1a(String(seedKey)));
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
