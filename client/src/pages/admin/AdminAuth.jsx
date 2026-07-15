import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAdminAuth } from "../../context/AdminAuthContext";
import SignUpForm from "../../components/admin/SignUpForm";
import LoginForm from "../../components/admin/LoginForm";
import VerifyCodeForm from "../../components/admin/VerifyCodeForm";
import GoogleOAuthButton from "../../components/admin/GoogleOAuthButton";

// ── Tab button ────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
        active
          ? "bg-blue-900 text-txt-primary shadow-sm"
          : "text-txt-muted hover:text-txt-primary"
      }`}
    >
      {label}
    </button>
  );
}

// ── Login Form is now a dedicated component: ../../components/admin/LoginForm

// ── Admin Auth page ─────────────────────────────────────────
function AdminAuthInner() {
  const [activeTab, setActiveTab]     = useState("signup");
  const [pendingEmail, setPendingEmail] = useState(null);
  const [oauthError, setOauthError]     = useState(false);

  const { setAdmin, loading, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Detect ?error=oauth_failed coming back from the Google callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_failed") {
      setOauthError(true);
      setActiveTab("login");
      // Clean the query param out of the URL without a reload
      params.delete("error");
      const cleanUrl =
        window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  function handleSignUpSuccess(email) {
    setPendingEmail(email);
  }

  function handleDuplicate() {
    setPendingEmail(null);
    setActiveTab("login");
  }

  function handleBackFromPending() {
    setPendingEmail(null);
  }

  // Called by VerifyCodeForm on successful verification
  function handleVerified(adminData) {
    setAdmin(adminData);
    navigate("/admin/dashboard");
  }

  // Already logged in (e.g. visiting the secret URL again, or after
  // /me restored the session on mount) skip the login form entirely.
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin Sign In | Pakistan Mock Test</title>
      </Helmet>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-4">
            <p className="text-xs text-center text-txt-secondary uppercase tracking-widest mb-1">
              Admin Portal
            </p>
            <h1 className="text-xl font-bold text-blue-900 text-center">
              Pakistan Mock Test
            </h1>
          </div>

          {/* Tab switcher hidden during OTP verification */}
          {!pendingEmail && (
            <div className="px-6 pb-2">
              <div className="flex gap-1 bg-bg rounded-lg p-1">
                <Tab
                  label="Sign Up"
                  active={activeTab === "signup"}
                  onClick={() => setActiveTab("signup")}
                />
                <Tab
                  label="Log In"
                  active={activeTab === "login"}
                  onClick={() => setActiveTab("login")}
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="px-8 pb-8 pt-4">
            {oauthError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                Google sign-in failed or was cancelled. Please try again.
              </div>
            )}

            {pendingEmail ? (
              <VerifyCodeForm
                email={pendingEmail}
                onBack={handleBackFromPending}
                onVerified={handleVerified}
              />
            ) : activeTab === "signup" ? (
              <SignUpForm
                onSuccess={handleSignUpSuccess}
                onDuplicate={handleDuplicate}
              />
            ) : (
              <LoginForm />
            )}

            {/* Google OAuth hidden during OTP verification */}
            {!pendingEmail && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-txt-secondary uppercase tracking-wide">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <GoogleOAuthButton />
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-txt-secondary mt-6">
          Authorised access only
        </p>
      </div>
    </div>
  );
}

export default function AdminAuth() {
  return <AdminAuthInner />;
}
