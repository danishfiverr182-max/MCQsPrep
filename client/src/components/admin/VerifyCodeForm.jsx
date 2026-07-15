import { useState, useEffect, useRef, useCallback } from "react";
import adminApi from "../../api/adminApi";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;
const CODE_EXPIRY_SEC = 10 * 60;

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatCountdown(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${pad(s)}`;
}

/**
 * Props
 *   email      {string}   address the code was sent to
 *   onBack     {function} called when user taps "← Back to Sign Up"
 *   onVerified {function} called with adminData on successful verification
 */
export default function VerifyCodeForm({ email, onBack, onVerified }) {
  const [digits, setDigits]           = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError]             = useState("");
  const [errorType, setErrorType]     = useState(""); // "expired" | "invalid" | ""
  const [loading, setLoading]         = useState(false);
  const [resendMsg, setResendMsg]     = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeExpiry, setCodeExpiry]   = useState(CODE_EXPIRY_SEC);

  const inputRefs = useRef([]);

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Code expiry countdown ──────────────────────────────────
  useEffect(() => {
    if (codeExpiry <= 0) return;
    const id = setInterval(() => {
      setCodeExpiry((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [codeExpiry]);

  // ── Resend cooldown countdown ──────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // ── Digit input handlers ───────────────────────────────────
  const handleChange = useCallback((index, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    setError("");
    setErrorType("");
    setDigits((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (val && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigits((prev) => { const n = [...prev]; n[index] = ""; return n; });
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((prev) => { const n = [...prev]; n[index - 1] = ""; return n; });
      }
    } else if (e.key === "ArrowLeft"  && index > 0)             inputRefs.current[index - 1]?.focus();
    else if   (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }, [digits]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < CODE_LENGTH; i++) next[i] = pasted[i] ?? "";
      return next;
    });
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }, []);

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setErrorType("");

    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await adminApi.post("/verify-code", { email, code });
      // Success hand admin data up to AdminAuth
      onVerified?.(data.admin);
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed. Please try again.";

      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("not found")) {
        setErrorType("expired");
        setError("Your code has expired please request a new one.");
        setCodeExpiry(0);
      } else {
        setErrorType("invalid");
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Resend ─────────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    setResendMsg("");
    setError("");
    setErrorType("");

    try {
      await adminApi.post("/resend-code", { email });
      setCodeExpiry(CODE_EXPIRY_SEC);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setResendMsg("A new code has been sent to your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend. Please try again.");
    }
  }

  const codeComplete = digits.every(Boolean);
  const isExpired    = codeExpiry === 0;

  // Resend button is highlighted when the code expired
  const resendHighlighted = errorType === "expired" || isExpired;

  return (
    <div className="text-center px-2">
      {/* Icon */}
      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      <h3 className="text-base font-bold text-txt-primary mb-1">Check your inbox</h3>
      <p className="text-sm text-txt-muted mb-1">A 6-digit code was sent to:</p>
      <p className="text-sm font-semibold text-blue-800 mb-6">{email}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* 6-box OTP input */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              aria-label={`Digit ${i + 1}`}
              className={`w-10 h-12 text-center text-xl font-bold font-mono border-2 rounded-lg
                outline-none transition select-none
                focus:ring-2 focus:ring-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errorType === "expired"
                  ? "border-orange-400 bg-orange-50 text-orange-700 focus:border-orange-500"
                  : errorType === "invalid"
                  ? "border-danger bg-red-50 text-red-700 focus:border-danger"
                  : digit
                  ? "border-blue-400 bg-blue-50 text-blue-900 focus:border-blue-500"
                  : "border-border bg-white text-txt-primary focus:border-blue-500"
                }
              `}
            />
          ))}
        </div>

        {/* Countdown */}
        <p className={`text-xs font-medium ${
          isExpired
            ? "text-red-500"
            : codeExpiry < 60
            ? "text-orange-500"
            : "text-txt-secondary"
        }`}>
          {isExpired
            ? "Code expired request a new one below"
            : `Code expires in ${formatCountdown(codeExpiry)}`}
        </p>

        {/* Error */}
        {error && (
          <div className={`border text-sm rounded-lg px-4 py-3 text-left ${
            errorType === "expired"
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {error}
          </div>
        )}

        {/* Success / resend feedback */}
        {resendMsg && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 text-left">
            {resendMsg}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !codeComplete || isExpired}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed
            text-txt-primary font-semibold text-sm py-2.5 rounded-lg transition
            flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>
      </form>

      {/* Resend highlighted when code is expired */}
      <div className="mt-4 flex flex-col items-center gap-1">
        {resendCooldown > 0 ? (
          <p className="text-xs text-txt-secondary">
            Resend available in <span className="font-semibold">{pad(resendCooldown)}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className={`text-sm font-semibold transition px-4 py-2 rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed ${
              resendHighlighted
                ? "bg-blue-900 text-txt-primary hover:bg-blue-800 animate-pulse"
                : "text-blue-700 hover:text-blue-900 underline underline-offset-2"
            }`}
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-txt-secondary hover:text-txt-muted underline underline-offset-2 mt-3"
      >
        ← Back to Sign Up
      </button>
    </div>
  );
}
