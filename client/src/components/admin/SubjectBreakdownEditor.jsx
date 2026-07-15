/**
 * components/admin/SubjectBreakdownEditor.jsx
 *
 * Reusable admin input for the "subject % breakdown" of a test/section —
 * e.g. Math 40%, English 30%, General Knowledge 30%. Purely informational:
 * shown to the user on the Start Test popup so they know the subject mix
 * before committing. A test never contains just one subject, so this is a
 * dynamic list (add/remove rows), not a single field.
 *
 * Not strictly validated to sum to 100 — the total is shown live and turns
 * amber/red if it's off, but admins can still save a partial breakdown.
 *
 * Props:
 *   value     array of { subject, percentage }
 *   onChange  (nextArray) => void
 */

import { useId } from "react";

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export default function SubjectBreakdownEditor({ value = [], onChange }) {
  const idBase = useId();
  const rows = value.length > 0 ? value : [];
  const total = rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0);

  function updateRow(index, patch) {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { subject: "", percentage: 0 }]);
  }

  function removeRow(index) {
    onChange(rows.filter((_, i) => i !== index));
  }

  const totalColor =
    total === 0 ? "text-txt-muted" : total === 100 ? "text-success" : "text-orange-400";

  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-sm text-txt-muted mb-3">
          No subjects added yet. A test usually covers more than one subject —
          add each subject and roughly what share of the test it makes up.
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {rows.map((row, i) => (
            <div key={`${idBase}-${i}`} className="flex items-center gap-2">
              <input
                type="text"
                value={row.subject}
                onChange={(e) => updateRow(i, { subject: e.target.value })}
                placeholder="e.g. Mathematics"
                className="flex-1 bg-bg border border-border hover:border-txt-muted focus:ring-2 focus:ring-accent/30 rounded-lg px-3 py-2 text-txt-primary text-sm focus:outline-none transition-colors"
              />
              <div className="relative w-24 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={row.percentage}
                  onChange={(e) => updateRow(i, { percentage: e.target.value })}
                  className="w-full bg-bg border border-border hover:border-txt-muted focus:ring-2 focus:ring-accent/30 rounded-lg pl-3 pr-6 py-2 text-txt-primary text-sm font-semibold focus:outline-none transition-colors"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-txt-muted">%</span>
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                title="Remove subject"
                className="shrink-0 text-danger/70 hover:text-danger transition p-2"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-amber-600 transition"
        >
          <PlusIcon />
          Add Subject
        </button>
        {rows.length > 0 && (
          <span className={`text-xs font-medium ${totalColor}`}>
            Total: {total}%{total !== 100 && " (doesn't have to be exactly 100)"}
          </span>
        )}
      </div>
    </div>
  );
}
