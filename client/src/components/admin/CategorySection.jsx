/**
 * CategorySection
 *
 * Renders a single category card on the Overview (/admin) page.
 * - Default categories (Army, Navy, Air Force): shows AddTestDropdown
 *   (Verbal → Non-Verbal → Academic 3-section flow).
 * - Custom categories (KPPSC, FPSC, etc.): shows TestGroupPanel
 *   (Group → Test → MCQ flow), matching the Dashboard behaviour.
 */

import { useState } from "react";
import TestSummaryRow from "./TestSummaryRow";
import AddTestDropdown from "./AddTestDropdown";
import TestGroupPanel from "./TestGroupPanel";
import EditCategoryDetailsModal from "./EditCategoryDetailsModal";

// ── Category folder icon ──────────────────────────────────────
function FolderIcon() {
  return (
    <svg
      className="w-5 h-5 text-accent"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
  );
}

// ── Pencil (edit) icon ─────────────────────────────────────────
function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5h2m-1 0v0M4 13.5V17h3.5L17 7.5 13.5 4 4 13.5z"
      />
    </svg>
  );
}

// ── Trash icon ────────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
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

// ── Custom category "Add Test" button that opens TestGroupPanel ──
function CustomCategoryButton({ category }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className={`shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition ${
          panelOpen
            ? "bg-accent text-white"
            : "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30"
        }`}
      >
        <span className="text-base leading-none">{panelOpen ? "−" : "+"}</span>
        Add {category.name} Test
      </button>

      {panelOpen && (
        <div className="mt-3">
          <TestGroupPanel
            category={category}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function CategorySection({ category, tests = [], onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="bg-surface/60 border border-border rounded-2xl overflow-hidden">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-surface/80">
        <div className="flex items-center gap-3">
          <FolderIcon />
          <div>
            <h3 className="text-txt-primary font-semibold text-base leading-tight">
              {category.name}
            </h3>
            <p className="text-txt-muted text-xs mt-0.5">
              {category.isDefault
                ? "3-section test (Verbal · Non-Verbal · Academic)"
                : "Custom tests · Group → Test → MCQs"}
              {!category.image && (
                <span className="text-amber-600/80"> · no cover image set</span>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            title={`Edit ${category.name} details`}
            className="inline-flex items-center gap-1.5 border border-border text-txt-secondary hover:bg-bg/60 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-txt-muted/30"
          >
            <PencilIcon />
            Edit Details
          </button>

          {category.isDeletable && onDelete && (
            <button
              onClick={() => onDelete(category)}
              title={`Delete ${category.name}`}
              className="inline-flex items-center gap-1.5 border border-danger/30 text-danger hover:bg-danger-light/10 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400/30"
            >
              <TrashIcon />
              Delete
            </button>
          )}

          {/* Default categories: 3-section dropdown. Custom: TestGroupPanel. */}
          {category.isDefault ? (
            <AddTestDropdown category={category} />
          ) : null}
        </div>
      </div>

      {/* ── Custom category TestGroupPanel (below header, full width) ── */}
      {!category.isDefault && (
        <div className="px-6 pt-4 pb-2">
          <CustomCategoryButton category={category} />
        </div>
      )}

      {/* ── Test list / empty state (only shown for default categories) ── */}
      {category.isDefault && (
        <div className="px-6 py-4">
          {tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-bg/60 flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-txt-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-txt-secondary text-sm">No tests added yet.</p>
              <p className="text-txt-muted text-xs mt-1">
                Click the button above to create the first test.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {tests.map((test) => (
                <TestSummaryRow key={test._id} test={test} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Details modal ───────────────────────────────── */}
      {showEditModal && (
        <EditCategoryDetailsModal
          category={category}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
