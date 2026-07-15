/**
 * MCQList.jsx  (Part 4 Prompt 05)
 *
 * Manages the array of MCQ containers and the 'Add MCQs' batch button.
 *
 * Props:
 *   mcqs           {array}    array of MCQ state objects
 *   totalMCQs      {number}   target total count set by the admin
 *   onChange       {function} called with updated full mcqs array
 *   showImageInput {boolean}  forwarded to each MCQContainer (non-verbal)
 */

import { useCallback, useEffect, useRef } from "react";
import MCQContainer from "./MCQContainer";

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function createEmptyMCQ() {
  return {
    question:      "",
    options:       ["", "", "", ""],
    correctIndex:  -1,
    explanation:   "",
    imageUrl:      "",
    imagePublicId: "",
  };
}

// onMcqEdit(index, updatedMcq) is optional: when provided, it's called on
// every single-MCQ edit so the parent can persist JUST that one MCQ
// (e.g. an incremental PATCH) instead of resending the whole array on
// every keystroke. onChange(nextFullArray) still fires too, to keep local
// React state (progress bar, completeness counts, etc.) correct — that
// part never touches the network by itself.
export default function MCQList({ mcqs = [], totalMCQs = 0, onChange, onMcqEdit, onAddBatch, showImageInput = false, erroredIndex = null }) {
  const remaining  = totalMCQs - mcqs.length;
  const batchSize  = Math.min(10, remaining);
  const canAddMore = remaining > 0;

  // Refs hold the latest values so handleMCQChange's identity below can
  // stay 100% stable across renders (empty dep array) — that stability is
  // what lets MCQContainer's React.memo actually skip re-rendering the
  // other 199 cards when you type in one of them.
  const mcqsRef = useRef(mcqs);
  const onChangeRef = useRef(onChange);
  const onMcqEditRef = useRef(onMcqEdit);
  useEffect(() => {
    mcqsRef.current = mcqs;
    onChangeRef.current = onChange;
    onMcqEditRef.current = onMcqEdit;
  });

  function handleAddBatch() {
    if (!canAddMore) return;
    const batch = Array.from({ length: batchSize }, () => createEmptyMCQ());
    onChange([...mcqs, ...batch]); // local state, so the new cards render immediately
    if (onAddBatch) onAddBatch(batchSize); // persist via $push — doesn't resend existing MCQs
  }

  const handleMCQChange = useCallback((index, updated) => {
    const current = mcqsRef.current;
    const next = [...current];
    next[index] = updated;
    onChangeRef.current(next);
    if (onMcqEditRef.current) onMcqEditRef.current(index, updated);
  }, []);

  const completedCount = mcqs.filter((m) => {
    const imageOk    = !showImageInput || (m.imageUrl && m.imageUrl.trim().length > 0);
    const questionOk = showImageInput ? true : m.question?.trim().length > 0;
    const optionsOk  = m.options?.every((o) => o?.trim().length > 0);
    const answerOk   = m.correctIndex >= 0;
    return imageOk && questionOk && optionsOk && answerOk;
  }).length;

  return (
    <div className="space-y-4">
      {/* ── Progress bar ──────────────────────────────────── */}
      {mcqs.length > 0 && (
        <div className="flex items-center justify-between text-xs text-txt-muted mb-1">
          <span>
            {completedCount} / {mcqs.length} filled
            {mcqs.length < totalMCQs && ` (${totalMCQs - mcqs.length} more to add)`}
          </span>
          <span className={mcqs.length === totalMCQs ? "text-success" : "text-txt-muted"}>
            {mcqs.length} / {totalMCQs} containers added
          </span>
        </div>
      )}

      {mcqs.length > 0 && (
        <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${totalMCQs > 0 ? (mcqs.length / totalMCQs) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* ── MCQ containers ────────────────────────────────── */}
      {mcqs.map((mcq, i) => (
        <MCQContainer
          key={i}
          index={i}
          mcq={mcq}
          onChange={handleMCQChange}
          showImageInput={showImageInput}
          hasServerError={erroredIndex === i}
        />
      ))}

      {/* ── Add MCQs button ───────────────────────────────── */}
      {totalMCQs > 0 && (
        <div className="pt-2">
          {canAddMore ? (
            <button
              type="button"
              onClick={handleAddBatch}
              className="inline-flex items-center gap-2 border border-accent/40 text-accent hover:bg-accent/10 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <PlusIcon />
              Add MCQs ({batchSize} at a time, {remaining} remaining)
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-success bg-success-light/10 border border-success/20 px-4 py-2.5 rounded-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              All {totalMCQs} containers added
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {mcqs.length === 0 && totalMCQs > 0 && (
        <div className="text-center py-10 bg-surface/40 border border-dashed border-border rounded-xl">
          <p className="text-txt-secondary text-sm mb-1">No MCQ containers yet</p>
          <p className="text-txt-secondary text-xs">Click "Add MCQs" above to add your first batch of 10</p>
        </div>
      )}
    </div>
  );
}
