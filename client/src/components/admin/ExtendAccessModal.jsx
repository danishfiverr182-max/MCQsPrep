import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// ── Duration options ──────────────────────────────────────────
const DURATIONS = [
  { key: "1week",  label: "1 Week",  days: 7,  price: "Rs. 300"   },
  { key: "1month", label: "1 Month", days: 30, price: "Rs. 1,000" },
];

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return " ";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function addDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function isExpiredDate(dateStr) {
  return Date.now() > new Date(dateStr).getTime();
}

// ── Modal ─────────────────────────────────────────────────────
export default function ExtendAccessModal({ userId, email, currentExpiresAt, onClose, onExtended }) {
  const [durationKey, setDurationKey] = useState("1month");
  const [loading,     setLoading]     = useState(false);
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Live preview computed client-side, no API call
  const selected   = DURATIONS.find((d) => d.key === durationKey);
  const newExpiry  = addDays(selected.days);
  const expired    = isExpiredDate(currentExpiresAt);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await api.patch(`/admin/users/${userId}/extend`, { durationKey });
      const { expiresAt, durationLabel } = res.data;

      toast.success(
        `Access extended for ${email}. New expiry: ${formatDate(expiresAt)}.`
      );

      // Bubble updated data up so parent can do optimistic row update
      onExtended({ expiresAt, isExpired: false, duration: durationLabel });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to extend access.");
    } finally {
      setLoading(false);
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
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-txt-primary">Extend Access</h2>
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
        <div className="px-6 py-5 space-y-5">

          {/* Email */}
          <div>
            <p className="text-xs text-txt-muted uppercase tracking-widest mb-1">Account</p>
            <p className="text-sm font-bold text-txt-primary truncate">{email}</p>
          </div>

          {/* Current expiry */}
          <div>
            <p className="text-xs text-txt-muted uppercase tracking-widest mb-1">Current Expiry</p>
            <p className={`text-sm font-medium ${expired ? "text-danger" : "text-txt-secondary"}`}>
              {formatDate(currentExpiresAt)}
              {expired && (
                <span className="ml-2 text-xs bg-danger-light/15 text-danger border border-danger/30 px-2 py-0.5 rounded-full">
                  Expired
                </span>
              )}
            </p>
          </div>

          {/* Duration selector */}
          <div>
            <p className="text-xs text-txt-muted uppercase tracking-widest mb-2">New Duration</p>
            <div className="space-y-2">
              {DURATIONS.map((d) => (
                <label
                  key={d.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    durationKey === d.key
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-txt-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="extend-duration"
                    value={d.key}
                    checked={durationKey === d.key}
                    onChange={() => setDurationKey(d.key)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-txt-primary flex-1">{d.label}</span>
                  <span className="text-xs text-txt-secondary">{d.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Live new expiry preview */}
          <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-txt-secondary">New expiry will be</span>
            <span className="text-sm font-semibold text-success">
              {formatDate(newExpiry)}
            </span>
          </div>

          {expired && (
            <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              This account is expired. Extending will reactivate it from today.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Extending…" : "Confirm Extension"}
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
