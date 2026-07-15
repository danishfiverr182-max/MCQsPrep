import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import adminApi from "../../api/adminApi";

// ── Zod schema ────────────────────────────────────────────────
const schema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be under 100 characters."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// ── Reusable field wrapper ────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-txt-muted uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

// ── Password visibility toggle input ─────────────────────────
function PasswordInput({ registration, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...registration}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition ${
          error ? "border-danger bg-red-50" : "border-border bg-white"
        }`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-secondary hover:text-txt-muted"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          // Eye-off icon
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          // Eye icon
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
// Props:
//   onSuccess(email)  called when server responds { pending: true }
//   onDuplicate()     called when server responds 409 (switches to Login tab)
export default function SignUpForm({ onSuccess, onDuplicate }) {
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setServerError("");
    setIsSubmitting(true);
    try {
      await adminApi.post("/register", {
        fullName:        data.fullName,
        email:           data.email,
        password:        data.password,
        confirmPassword: data.confirmPassword,
      });
      // Server returned 200 { pending: true }
      onSuccess(data.email);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message || "Something went wrong. Please try again.";

      if (status === 409) {
        // Duplicate email check if it's a "please log in" message
        if (message.toLowerCase().includes("already exists")) {
          onDuplicate(); // switch to Login tab
        } else {
          setServerError(message); // pending code already sent
        }
      } else {
        setServerError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Server-level error banner */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      <Field label="Full Name" error={errors.fullName?.message}>
        <input
          {...register("fullName")}
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.fullName ? "border-danger bg-red-50" : "border-border bg-white"
          }`}
        />
      </Field>

      <Field label="Email Address" error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="admin@example.com"
          autoComplete="email"
          className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.email ? "border-danger bg-red-50" : "border-border bg-white"
          }`}
        />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <PasswordInput
          registration={register("password")}
          placeholder="Min. 8 characters"
          error={errors.password}
        />
      </Field>

      <Field label="Confirm Password" error={errors.confirmPassword?.message}>
        <PasswordInput
          registration={register("confirmPassword")}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-txt-primary font-semibold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isSubmitting ? "Sending code…" : "Create Account"}
      </button>
    </form>
  );
}
