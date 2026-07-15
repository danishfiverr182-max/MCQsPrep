/**
 * src/context/AuthContext.jsx  (Prompt 3   Expiry Enforcement & Access Control)
 *
 * Changes:
 *  - Added sessionExpired state (boolean, default false).
 *  - When GET /api/user/auth/me returns 403 (account expired mid-session),
 *    premiumUser is set to null and sessionExpired is set to true.
 *  - sessionExpired is exposed in context so any page can show the
 *    "Your premium access has expired" banner.
 *  - clearExpiredSession() helper lets the Navbar / banner dismiss the state
 *    (e.g., after the user logs out or dismisses the banner).
 *  - All other behaviour (parallel admin + user session check, isLoading) unchanged.
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser,      setAdminUser]      = useState(null);
  const [premiumUser,    setPremiumUser]    = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // On app load: check both admin and premium user sessions in parallel.
  // Promise.allSettled means a 401/403 on one endpoint never blocks the other.
  useEffect(() => {
    Promise.allSettled([
      api.get("/admin/auth/me"),
      api.get("/user/auth/me"),
    ]).then(([adminResult, userResult]) => {
      // ── Admin session ──────────────────────────────────────────
      if (adminResult.status === "fulfilled") {
        setAdminUser(adminResult.value.data);
      }

      // ── Premium user session ───────────────────────────────────
      if (userResult.status === "fulfilled") {
        setPremiumUser(userResult.value.data);
        setSessionExpired(false);
      } else {
        // Check if the rejection was a 403 (account expired mid-session).
        // axios wraps the HTTP response in error.response.
        const status = userResult.reason?.response?.status;
        if (status === 403) {
          // Expired: clear any stale user data and flag the session as expired
          // so the ExpiredSessionBanner can render across all pages.
          setPremiumUser(null);
          setSessionExpired(true);
        }
        // 401 (no cookie / bad JWT) is the normal "not logged in" state   no flag needed.
      }
    }).finally(() => setIsLoading(false));
  }, []);

  /** Call this when the user dismisses the banner or explicitly logs out. */
  function clearExpiredSession() {
    setSessionExpired(false);
  }

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        setAdminUser,
        premiumUser,
        setPremiumUser,
        isLoading,
        sessionExpired,
        clearExpiredSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
