import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../../api/axios";
import { useAdminAuth } from "../../context/AdminAuthContext";

// ── Shared components ─────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-txt-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
      />
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {message}
    </p>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 bg-blue-900 text-txt-primary rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 w-full"
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}

// ── Sign Up Form ──────────────────────────────────────────────
function SignUpForm({ onSuccess }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      return setError("All fields are required.");
    }
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const { data } = await api.post("/admin/auth/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      onSuccess(data.email, form.fullName);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Muhammad Ali" />
      <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="admin@example.com" />
      <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" />
      <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" />
      <ErrorBox message={error} />
      <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating account…" />
    </form>
  );
}

// ── Verify Code Screen ────────────────────────────────────────
function VerifyCodeScreen({ email, fullName }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAdmin } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (code.length !== 6) return setError("Please enter the full 6-digit code.");

    setLoading(true);
    try {
      const { data } = await api.post("/admin/auth/verify-code", { email, code });
      setAdmin(data.admin);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-3">
          📧
        </div>
        <h3 className="font-semibold text-txt-primary">Check your email</h3>
        <p className="text-txt-muted text-sm mt-1">
          A 6-digit code was sent to
        </p>
        <p className="font-medium text-blue-900 text-sm">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-txt-secondary">Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition text-center text-xl tracking-widest font-mono"
          />
        </div>
        <ErrorBox message={error} />
        <SubmitButton loading={loading} label="Verify & Continue" loadingLabel="Verifying…" />
      </form>

      <p className="text-xs text-txt-secondary text-center">
        Didn't receive the code? Contact your system administrator.
      </p>
    </div>
  );
}

// ── Log In Form ───────────────────────────────────────────────
function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) return setError("Both fields are required.");

    setLoading(true);
    try {
      const { data } = await api.post("/admin/auth/login", {
        email: form.email,
        password: form.password,
      });
      setAdmin(data.admin);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="admin@example.com" />
      <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" />
      <ErrorBox message={error} />
      <SubmitButton loading={loading} label="Log In" loadingLabel="Logging in…" />
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminLoginPage() {
  const [tab, setTab] = useState("login");
  // verifyState: null | { email, fullName }
  const [verifyState, setVerifyState] = useState(null);

  const tabs = [
    { id: "signup", label: "Sign Up" },
    { id: "login", label: "Log In" },
  ];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-border overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-2">
          <h2 className="text-xl font-bold text-blue-900 text-center">Admin Portal</h2>
          <p className="text-xs text-center text-txt-secondary mt-1">Pakistan Mock Test Platform</p>
        </div>

        {/* Tabs hidden during code verification */}
        {!verifyState && (
          <div className="flex border-b border-border mt-6 px-8">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "text-blue-900 border-b-2 border-accent"
                    : "text-txt-secondary hover:text-txt-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-8 py-6">
          {verifyState ? (
            <VerifyCodeScreen email={verifyState.email} fullName={verifyState.fullName} />
          ) : tab === "signup" ? (
            <SignUpForm
              onSuccess={(email, fullName) => setVerifyState({ email, fullName })}
            />
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
}
