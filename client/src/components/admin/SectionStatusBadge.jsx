/**
 * SectionStatusBadge.jsx  (Part 4 Prompt 07)
 *
 * Small reusable badge used inside TestTable to show whether a single
 * section (Verbal / Non-Verbal / Academic) of a test is complete or
 * still pending.
 *
 * Props:
 *   label   e.g. "Verbal", "Non-Verbal", "Academic"
 *   status  'complete' | 'pending'
 */

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export default function SectionStatusBadge({ label, status }) {
  const isComplete = status === "complete";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border whitespace-nowrap ${
        isComplete
          ? "text-success bg-success-light/10 border-success/20"
          : "text-txt-muted bg-bg/40 border-border/40"
      }`}
      title={`${label}: ${isComplete ? "Complete" : "Pending"}`}
    >
      {isComplete ? <CheckIcon /> : <DashIcon />}
      <span>{label}</span>
      <span className="opacity-70">{isComplete ? "Done" : "Pending"}</span>
    </span>
  );
}
