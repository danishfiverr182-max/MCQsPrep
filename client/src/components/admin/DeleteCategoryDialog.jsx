/**
 * DeleteCategoryDialog.jsx  (Prompt 99   Data Integrity Validation)
 *
 * Category-delete confirmation modal that requires the admin to type the
 * category name EXACTLY (case-sensitive) before the "Confirm Delete"
 * button activates. Replaces the plain yes/no ConfirmDialog for category
 * deletion, since deleting a category cascades to all of its tests, MCQs,
 * and premium-user access   a much higher-stakes action than a simple
 * confirm dialog should gate.
 *
 * Props:
 *   isOpen      boolean; controls visibility
 *   category    { name, slug } | null   the category pending deletion
 *   onConfirm   callback fired when the typed name matches and Confirm is clicked
 *   onCancel    callback fired when Cancel / backdrop is clicked
 *   loading     boolean; disables inputs/buttons and shows a spinner
 *   error       optional error string (e.g. from a failed delete request)
 */

import { useEffect, useState } from "react";

export default function DeleteCategoryDialog({
  isOpen,
  category,
  onConfirm,
  onCancel,
  loading = false,
  error = "",
}) {
  const [typedName, setTypedName] = useState("");

  // Reset the typed input whenever a new category is targeted / dialog re-opens
  useEffect(() => {
    if (isOpen) setTypedName("");
  }, [isOpen, category?.slug]);

  if (!isOpen || !category) return null;

  const nameMatches = typedName === category.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={loading ? undefined : onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger-light/10 mx-auto">
          <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-txt-primary">Delete "{category.name}"?</h2>
          <p className="text-txt-secondary text-sm leading-relaxed">
            This will permanently delete the <span className="text-txt-primary font-medium">{category.name}</span>{" "}
            category and ALL associated tests, MCQs, and user access. This cannot be undone.
          </p>
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-light/10 border border-danger/20 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

        {/* Type-to-confirm input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-txt-secondary">
            Type <span className="text-txt-primary font-semibold">{category.name}</span> to confirm
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            disabled={loading}
            autoFocus
            placeholder={category.name}
            className={`w-full bg-surface border-2 rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted
              focus:outline-none focus:ring-2 transition-colors duration-150
              ${
                typedName.length === 0
                  ? "border-danger focus:ring-danger"
                  : nameMatches
                  ? "border-success focus:ring-success"
                  : "border-danger focus:ring-danger"
              }`}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-border text-txt-secondary hover:bg-surface transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-txt-muted/40 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading || !nameMatches}
            title={!nameMatches ? "Type the category name exactly to enable this button" : ""}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 bg-danger hover:bg-red-700 text-white focus:ring-red-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {loading ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
