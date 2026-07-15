/**
 * src/public/components/SectionInstructionsModal.jsx  (Part 8 Prompt 03)
 *
 * Modal overlay displayed when the user clicks a "Not Started" section button
 * on the Test Hub. Shows section details and requires an explicit confirmation
 * before the timer starts.
 *
 * Props:
 *   sectionName       string   "Verbal" | "Non-Verbal" | "Academic"
 *   mcqCount          number   total questions in this section
 *   timeLimitSeconds  number   time limit in seconds (formatted as HH:MM:SS)
 *   subjectBreakdown  array    optional [{ subject, percentage }] admin-entered mix
 *   onStart()         fn       called when "Start Test" is confirmed
 *   onClose()         fn       called when X or backdrop is clicked
 *
 * Rendered via ReactDOM.createPortal into document.body so it sits above all
 * other content regardless of CSS stacking context.
 *
 * localStorage is NOT touched here the parent (TestHubPage) writes
 * 'inProgress' and then calls onStart(), which triggers navigation.
 */

import { useEffect } from "react";
import ReactDOM from "react-dom";
import { formatDuration } from "../utils/formatDuration";
import { LuClock3 } from "react-icons/lu";


// ── Info row ──────────────────────────────────────────────────
function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-txt-secondary">{label}</span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-accent font-bold" : "text-txt-primary"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SectionInstructionsModal({
  sectionName,
  mcqCount,
  timeLimitSeconds,
  onStart,
  onClose,
  passMark = "50%",
  subjectBreakdown = [],
}) {
  // ── Lock body scroll while modal is open ──────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Close on Escape key ───────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Modal content ─────────────────────────────────────────────
  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-dark px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
              Section Instructions
            </p>
            <h2
              id="section-modal-title"
              className="text-txt-onPrimary font-bold text-lg"
            >
              {sectionName}
            </h2>
          </div>
          {/* X close button */}
          <button
            onClick={onClose}
            className="mt-0.5 ml-4 shrink-0 text-blue-200 hover:text-white transition"
            aria-label="Close instructions"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Info rows */}
          <div className="mb-6">
            <InfoRow label="Total Questions" value={mcqCount} />
            <InfoRow
              label="Time Limit"
              value={formatDuration(timeLimitSeconds)}
              highlight
            />
            <InfoRow label="Passing Mark" value={passMark} />
            <InfoRow label="Attempts" value="Unlimited" />
          </div>

          {/* Subject breakdown */}
          {subjectBreakdown.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-txt-muted mb-2.5">
                Subject Breakdown
              </p>
              <div className="space-y-2">
                {subjectBreakdown.map((row, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-txt-secondary">{row.subject}</span>
                      <span className="text-txt-primary font-semibold">{row.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, row.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="bg-accent-light border border-accent rounded-xl px-4 py-3 mb-6">
            <p className="flex items-start gap-2 text-xs text-amber-800 font-medium leading-relaxed">
              <LuClock3 className="mt-0.5 text-base shrink-0" />
              <span>
                The timer starts the moment you click{" "}
                <strong>Start Test</strong>. Make sure you are ready before
                proceeding.
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-semibold text-txt-secondary bg-surface border border-border hover:text-txt-primary px-4 py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={onStart}
              className="flex-1 bg-brand text-white hover:bg-brand-dark font-bold text-lg py-3 rounded-xl transition"
            >
              Start Test →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
