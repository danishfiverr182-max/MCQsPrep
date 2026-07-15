/**
 * MCQContainer.jsx  (Part 4 Prompt 05)
 *
 * Single MCQ editor container.
 * Renders: question textarea, optional image input (non-verbal),
 * four answer inputs (A/B/C/D), and a radio-style correct-answer selector.
 *
 * Props:
 *   index          {number}   0-based position (display as #N)
 *   mcq            {object}   MCQ state object
 *   onChange       {function} called with updated MCQ on any field change
 *   showImageInput {boolean}  when true, renders ImageInput between question and options
 */

import { memo } from "react";
import ImageInput from "./ImageInput";

const ANSWER_LABELS = ["A", "B", "C", "D"];

const LABEL_COLORS = [
  "text-brand  border-blue-500/40  bg-brand/10",
  "text-success border-success/40 bg-success-light/10",
  "text-brand border-purple-500/40 bg-purple-500/10",
  "text-orange-400 border-orange-500/40 bg-orange-500/10",
];

// Wrapped in React.memo so typing in ONE container doesn't re-render every
// other MCQ card on screen. This only helps if the `onChange` prop is a
// STABLE reference — that's why the contract below is onChange(index, mcq)
// instead of onChange(mcq): the parent (MCQList) can now pass one function
// that never changes identity across renders, instead of creating a new
// arrow-function closure per row on every render (which would silently
// defeat memoization even with this wrapper in place).
function MCQContainer({ index, mcq, onChange, showImageInput = false, hasServerError = false }) {
  const {
    question     = "",
    options      = ["", "", "", ""],
    correctIndex = -1,
    imageUrl      = "",
    imagePublicId = "",
  } = mcq;

  function handleQuestion(e) {
    onChange(index, { ...mcq, question: e.target.value });
  }

  function handleOption(optIndex, value) {
    const newOptions = [...options];
    newOptions[optIndex] = value;
    onChange(index, { ...mcq, options: newOptions });
  }

  function handleCorrect(optIndex) {
    onChange(index, { ...mcq, correctIndex: optIndex });
  }

  function handleImageChange({ imageUrl: url, imagePublicId: pid }) {
    onChange(index, { ...mcq, imageUrl: url, imagePublicId: pid });
  }

  // ── Completeness check ───────────────────────────────────
  const hasImage    = imageUrl && imageUrl.trim().length > 0;
  const imageOk     = !showImageInput || hasImage;
  const questionOk  = showImageInput
    ? true // optional for non-verbal
    : question.trim().length > 0;
  const optionsOk   = Array.isArray(options) && options.every((o) => o?.trim().length > 0);
  const answerOk    = typeof correctIndex === "number" && correctIndex >= 0;

  const isComplete  = imageOk && questionOk && optionsOk && answerOk;

  return (
    <div
      id={`mcq-container-${index}`}
      className={`bg-surface/70 border-2 rounded-xl p-5 transition-colors duration-150 ${
        hasServerError
          ? "border-danger ring-2 ring-red-500/30"
          : isComplete
          ? "border-success/30"
          : "border-border"
      }`}
    >
      {hasServerError && (
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-danger bg-danger-light/10 border border-danger/20 px-2.5 py-1.5 rounded-lg">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This MCQ caused the save error above
        </div>
      )}
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
          MCQ #{index + 1}
        </span>
        {isComplete && (
          <span className="inline-flex items-center gap-1 text-xs text-success bg-success-light/10 border border-success/20 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Complete
          </span>
        )}
      </div>

      {/* ── Question (always shown; optional for non-verbal) ── */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-txt-secondary mb-1.5">
          Question{showImageInput && <span className="text-txt-muted ml-1">(optional)</span>}
        </label>
        <textarea
          value={question}
          onChange={handleQuestion}
          rows={3}
          placeholder={
            showImageInput
              ? "Enter supporting question text (optional)…"
              : "Enter the question text…"
          }
          className="w-full bg-bg/80 border border-border hover:border-txt-muted focus:ring-2 focus:ring-brand/60 focus:ring-1 focus:ring-accent/30 rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted resize-none transition-colors duration-150 focus:outline-none"
        />
      </div>

      {/* ── Image input (non-verbal only) ───────────────────── */}
      {showImageInput && (
        <div className="mb-4">
          <ImageInput
            imageUrl={imageUrl}
            imagePublicId={imagePublicId}
            onChange={handleImageChange}
          />
        </div>
      )}

      {/* ── Answer options ───────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-txt-secondary mb-2">
          Answer Options click the circle to mark the correct answer
        </label>

        {ANSWER_LABELS.map((label, i) => {
          const isSelected = correctIndex === i;
          return (
            <div key={i} className="flex items-center gap-3">
              {/* Correct-answer radio button */}
              <button
                type="button"
                onClick={() => handleCorrect(i)}
                title={`Mark Answer ${label} as correct`}
                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                  isSelected
                    ? "border-accent bg-accent"
                    : "border-txt-muted bg-transparent hover:border-txt-muted"
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-txt-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Answer label badge */}
              <span className={`flex-shrink-0 w-6 h-6 rounded-md border text-xs font-bold flex items-center justify-center ${LABEL_COLORS[i]}`}>
                {label}
              </span>

              {/* Answer text input */}
              <input
                type="text"
                value={options[i] ?? ""}
                onChange={(e) => handleOption(i, e.target.value)}
                placeholder={`Answer ${label}`}
                className="flex-1 bg-bg/80 border border-border hover:border-txt-muted focus:ring-2 focus:ring-brand/60 focus:ring-1 focus:ring-accent/30 rounded-lg px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted transition-colors duration-150 focus:outline-none"
              />
            </div>
          );
        })}
      </div>

      {/* ── Validation hints ─────────────────────────────────── */}
      {!isComplete && (imageUrl || question.trim() || options.some((o) => o.trim())) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {showImageInput && !hasImage && (
            <span className="text-xs text-danger bg-danger-light/10 px-2 py-0.5 rounded-full">
              Image required
            </span>
          )}
          {!showImageInput && !question.trim() && (
            <span className="text-xs text-danger bg-danger-light/10 px-2 py-0.5 rounded-full">
              Question required
            </span>
          )}
          {options.some((o) => !o.trim()) && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              All 4 answers required
            </span>
          )}
          {correctIndex < 0 && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              Select correct answer
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MCQContainer);
