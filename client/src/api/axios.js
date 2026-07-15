/**
 * src/api/axios.js  (updated Prompt 88   mid-session expiry interceptor)
 *
 * Changes from previous version:
 *  - A response interceptor is added that watches for the structured
 *    ACCESS_EXPIRED response from the backend on any premium-protected call.
 *  - When detected, the interceptor calls any registered handler via a simple
 *    callback registry (accessExpiredHandlers).  This decouples the axios
 *    module from React   React components register their handlers at mount
 *    time via registerAccessExpiredHandler().
 *  - The interceptor re-throws the error so individual call-site .catch()
 *    blocks still run normally (e.g., to clear a loading spinner).  The
 *    registered handler deals with navigation/toast/auth-clear separately.
 *
 * Usage in React:
 *   import { registerAccessExpiredHandler, unregisterAccessExpiredHandler }
 *     from "../api/axios";
 *
 *   // In a top-level component (e.g. UserLayout):
 *   useEffect(() => {
 *     const id = registerAccessExpiredHandler(({ message }) => {
 *       setPremiumUser(null);
 *       toast.error(message);
 *       navigate("/");
 *     });
 *     return () => unregisterAccessExpiredHandler(id);
 *   }, []);
 */

import axios from "axios";

// ── Callback registry ─────────────────────────────────────────────────────────
// Handlers registered here are called when any response has code ACCESS_EXPIRED.
// Multiple handlers can coexist (e.g. UserLayout + TakeTestPage each register
// their own), so the last-registered one wins for navigation but all fire.
// In practice only UserLayout registers   TakeTestPage detects 403 in its own
// .catch() block for the "show message before navigating" requirement.

let _nextId = 1;
const _handlers = new Map();

export function registerAccessExpiredHandler(fn) {
  const id = _nextId++;
  _handlers.set(id, fn);
  return id;
}

export function unregisterAccessExpiredHandler(id) {
  _handlers.delete(id);
}

// ── Axios instance ────────────────────────────────────────────────────────────
// In dev the Vite server proxies `/api` to the backend. For preview/other
// environments allow overriding the target with `VITE_API_TARGET` so the
// client can talk directly to the backend (e.g. when `npm run preview` is used).
const API_TARGET = import.meta.env.VITE_API_TARGET || "";

const api = axios.create({
  baseURL:         `${API_TARGET}/api`,
  withCredentials: true,
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  // Passthrough for successful responses
  (response) => response,

  // Error handler
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    if (status === 403 && code === "ACCESS_EXPIRED") {
      const message =
        error.response?.data?.message ||
        "Your access has expired. Please contact the admin to renew your subscription.";

      // Fire all registered handlers; they handle auth-clear, toast, navigate.
      for (const fn of _handlers.values()) {
        try { fn({ message }); } catch { /* never let a handler crash the interceptor */ }
      }
    }

    // Always re-throw so individual .catch() blocks in components still run.
    return Promise.reject(error);
  }
);

export default api;
