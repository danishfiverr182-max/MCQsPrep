/**
 * MCQDisplayCard  (Prompt 08)
 *
 * Read-only MCQ display card used in TestViewPage.
 * Shows: numbered heading, question text, optional image (Non-Verbal only),
 * four answer options (A/B/C/D), correct answer highlighted in green.
 *
 * Props:
 *   mcq   { question, options: string[4], correctIndex, imageUrl? }
 *   index 0-based position (displayed as "MCQ 1", "MCQ 2", …)
 */

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function MCQDisplayCard({ mcq, index }) {
  if (!mcq) return null;

  return (
    <div className="bg-surface/60 border border-border rounded-2xl p-5 space-y-4 print:border print:border-txt-secondary print:rounded-none print:bg-white print:text-black print:p-4 print:mb-4">
      {/* ── Heading ─────────────────────────────────────────── */}
      <p className="text-xs font-semibold uppercase tracking-widest text-txt-primary print:text-txt-muted">
        MCQ {index + 1}
      </p>

      {/* ── Question text ────────────────────────────────────── */}
      <p className="text-sm text-black-400 font-bold leading-relaxed print:text-black">
        {mcq.question || <span className="italic text-txt-muted">No question text</span>}
      </p>

      {/* ── Image (Non-Verbal only rendered only when imageUrl present) ── */}
      {mcq.imageUrl && (
        <div className="pt-1">
          <img
            src={mcq.imageUrl}
            alt={`MCQ ${index + 1} image`}
            className="max-w-full h-auto rounded-lg border border-border print:border print:border-txt-secondary"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}

      {/* ── Answer options ───────────────────────────────────── */}
      <div className="space-y-2">
        {(mcq.options || []).map((option, i) => {
          const isCorrect = i === mcq.correctIndex;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-2.5 rounded-xl border text-sm print:rounded print:px-3 print:py-2 ${
                isCorrect
                  ? "bg-success-light/15 border-success/40 text-green-300 print:bg-green-50 print:border-success print:text-green-800"
                  : "bg-bg/30 border-border/40 text-txt-secondary print:bg-white print:border-txt-secondary print:text-black"
              }`}
            >
              {/* Label bubble */}
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  isCorrect
                    ? "bg-success-light text-white"
                    : "bg-txt-muted text-txt-secondary print:bg-border print:text-txt-primary"
                }`}
              >
                {OPTION_LABELS[i]}
              </span>

              {/* Option text */}
              <span className="flex-1 leading-snug">
                {option || <em className="opacity-50">Empty</em>}
              </span>

              {/* ✓ Correct badge */}
              {isCorrect && (
                <span className="flex-shrink-0 text-xs font-semibold text-success print:text-green-700 mt-0.5">
                  ✓ Correct
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
