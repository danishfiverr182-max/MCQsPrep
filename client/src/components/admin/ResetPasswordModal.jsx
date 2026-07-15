import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// ── Copy Button ───────────────────────────────────────────────
function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed please copy manually.");
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex-shrink-0 p-1.5 rounded-md text-txt-secondary hover:text-brand hover:bg-bg transition"
    >
      {copied ? (
        // Check icon
        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        // Copy icon
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 1 2-2v-8a2 2 0 0 1-2-2h-8a2 2 0 0 1-2 2v8a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}

// ── Copyable Field ────────────────────────────────────────────
function CopyableField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-txt-secondary mb-1">{label}</p>
      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
        <span className="flex-1 text-sm text-txt-primary font-mono break-all">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────
export default function ResetPasswordModal({ userId, email, onClose }) {
  const [step,        setStep]        = useState(1); // 1 = confirm, 2 = success
  const [loading,     setLoading]     = useState(false);
  const [newPassword, setNewPassword] = useState("");

  async function handleReset() {
    setLoading(true);
    try {
      const { data } = await api.post(`/admin/users/${userId}/reset-password`);
      setNewPassword(data.newPassword);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md">

        {/* ── Step 1: Confirmation ── */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-light/40 rounded-xl">
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-txt-primary">Reset Password</h2>
                  <p className="text-xs text-txt-secondary mt-0.5 truncate max-w-[220px]">{email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-txt-muted hover:text-txt-secondary transition mt-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Warning banner */}
            <div className="bg-amber-900/25 border border-amber-700/50 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-green-600 leading-relaxed">
                  The user cannot log in with their current password once you reset it. Make sure to send them the new password immediately.
                </p>
              </div>
            </div>

            <p className="text-sm text-txt-secondary">
              Are you sure you want to reset the password for <span className="text-txt-primary font-medium">{email}</span>?
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-txt-secondary hover:bg-bg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-txt-primary text-sm font-medium transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: New Credentials ── */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-900/40 rounded-xl">
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-txt-primary">Password Reset Successfully</h2>
                  <p className="text-xs text-txt-secondary mt-0.5">Share the new credentials with the user</p>
                </div>
              </div>
            </div>

            {/* Copyable credentials */}
            <div className="space-y-3">
              <CopyableField label="Email" value={email} />
              <CopyableField label="New Password" value={newPassword} />
            </div>

            {/* Retrieval note */}
            <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3.5">
              <div className="flex gap-2.5">
                <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-xs text-blue-300 leading-relaxed">
                  Send this password to the user now. You can retrieve it within 24 hours from their account details.
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl bg-bg hover:bg-bg text-txt-primary text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
