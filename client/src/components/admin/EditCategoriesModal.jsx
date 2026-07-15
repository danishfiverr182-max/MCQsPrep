import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAdminCategories } from "../../context/CategoriesContext";

export default function EditCategoriesModal({ userId, email, currentSlugs, onClose, onSaved }) {
  const { categories, loading: catsLoading } = useAdminCategories();

  // Pre-check with the user's current slugs
  const [selected, setSelected] = useState(() => new Set(currentSlugs || []));
  const [saving,   setSaving]   = useState(false);
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggle(slug) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function selectAll()  { setSelected(new Set(categories.map((c) => c.slug))); }
  function clearAll()   { setSelected(new Set()); }

  // Disabled if nothing selected OR selection identical to original
  const originalSet = new Set(currentSlugs || []);
  const unchanged   = selected.size === originalSet.size &&
    [...selected].every((s) => originalSet.has(s));
  const saveDisabled = selected.size === 0 || unchanged;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.patch(`/admin/users/${userId}/categories`, {
        categorySlugs: [...selected],
      });

      toast.success(`Category access updated for ${email}.`);
      // Pass enriched data back so parent can update the row
      onSaved({ accessCategories: res.data.accessCategories });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update categories.");
    } finally {
      setSaving(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-txt-primary">Edit Categories</h2>
            <p className="text-xs text-txt-secondary mt-0.5 truncate max-w-[220px]">{email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-txt-secondary hover:text-txt-primary transition p-1 rounded-lg hover:bg-surface"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {/* Select All / Clear All */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-txt-muted uppercase tracking-widest">
              {selected.size} selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="text-xs text-accent hover:text-amber-600 transition"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-txt-muted hover:text-txt-secondary transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Category checklist */}
          {catsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-txt-secondary text-center py-4">No categories found.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const checked = selected.has(cat.slug);
                return (
                  <label
                    key={cat._id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                      checked
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-txt-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(cat.slug)}
                      className="accent-accent w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-txt-primary truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-txt-muted truncate mt-0.5">{cat.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Validation hint */}
          {selected.size === 0 && (
            <p className="text-xs text-danger text-center">
              At least one category must be selected.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-border shrink-0 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saveDisabled || saving}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-txt-secondary hover:text-txt-primary border border-border hover:border-txt-muted text-sm py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
