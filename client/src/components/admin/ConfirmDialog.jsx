/**
 * ConfirmDialog
 *
 * A reusable modal confirmation dialog.
 * Renders a backdrop + card with a title, message, and two buttons.
 *
 * Props:
 *   isOpen        boolean; controls visibility
 *   title         heading text (e.g. "Delete Category")
 *   message       body text (e.g. "Are you sure…?")
 *   confirmLabel  label for the confirm button (default: "Confirm")
 *   cancelLabel   label for the cancel button  (default: "Cancel")
 *   onConfirm     callback fired when the confirm button is clicked
 *   onCancel      callback fired when the cancel button or backdrop is clicked
 *   dangerous     boolean; if true, confirm button is styled in red (default: true)
 *   loading       boolean; disables buttons and shows spinner on confirm button
 */

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  dangerous = true,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      {/* Card stop click from bubbling to backdrop */}
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger-light/10 mx-auto">
          <svg
            className="w-6 h-6 text-danger"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-bold text-txt-primary">{title}</h2>
          {message && (
            <p className="text-txt-secondary text-sm leading-relaxed">{message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-border text-txt-secondary hover:bg-surface transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-txt-muted/40 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50
              ${
                dangerous
                  ? "bg-danger hover:bg-red-700 text-white focus:ring-red-400/40"
                  : "bg-accent hover:bg-accent-dark text-white focus:ring-accent/40"
              }`}
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
