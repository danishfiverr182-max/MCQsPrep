import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin-x9k2";

// ── ProtectedAdminRoute ──────────────────────────────────────
// - While the initial /me check is in flight: show a spinner
//   (avoids a flash of unauthenticated content).
// - Once resolved: render children if authenticated, otherwise
//   redirect to the secret login page.
export default function ProtectedAdminRoute({ children }) {
  const { loading, isAuthenticated } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ADMIN_PATH} replace />;
  }

  return children;
}
