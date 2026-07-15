/**
 * TestSummaryRow
 *
 * A single row in a category's test list.
 * Displays: test name, created date, Edit and Delete action buttons.
 *
 * Props:
 *   test { _id, name, createdAt, ... }
 *
 * Edit / Delete handlers are stubs wired fully in Part 4.
 */

// ── Icons ─────────────────────────────────────────────────────
function EditIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return " ";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return " ";
  }
}

export default function TestSummaryRow({ test }) {
  // Stub handlers Part 4 will wire these up
  const handleEdit = () => {
    console.log("Edit test (stub):", test._id);
  };

  const handleDelete = () => {
    console.log("Delete test (stub):", test._id);
  };

  return (
    <div className="flex items-center justify-between py-3 gap-4">
      {/* Test info */}
      <div className="flex-1 min-w-0">
        <p className="text-txt-primary text-sm font-medium truncate">{test.name}</p>
        <p className="text-txt-muted text-xs mt-0.5">{formatDate(test.createdAt)}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-blue-300 bg-blue-400/10 hover:bg-brand-dark/20 border border-blue-400/20 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <EditIcon />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:text-red-300 bg-danger-light/10 hover:bg-danger-light/20 border border-danger/20 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <DeleteIcon />
          Delete
        </button>
      </div>
    </div>
  );
}
