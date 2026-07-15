import axios from "axios";
import toast from "react-hot-toast";

// This instance targets the secret admin auth path.
// Vite proxies /admin-x9k2/* → http://localhost:5000/admin-x9k2/*
// so there are no CORS issues in development.
// In production, point VITE_ADMIN_PATH to your real secret prefix.
const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin-x9k2";
const API_TARGET = import.meta.env.VITE_API_TARGET || "";

const adminApi = axios.create({
  baseURL: `${API_TARGET}${ADMIN_PATH}`,
  withCredentials: true, // send/receive httpOnly cookies
});

// ── Response interceptor global 401 / 429 handling ─────────
// Intercepts every response from this Axios instance so individual
// pages don't need to duplicate session-expiry or rate-limit logic.
adminApi.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  // Handle error responses centrally
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || "";
    const expired = error.response?.data?.expired;

    if (status === 401) {
      if (expired || message.toLowerCase().includes("expired")) {
        // Token has expired show a toast then redirect to login
        toast.error("Your session has expired. Please log in again.", {
          id: "session-expired", // deduplicate only one toast at a time
          duration: 4000,
        });

        // Small delay so the user sees the toast before the redirect
        setTimeout(() => {
          window.location.href = `${ADMIN_PATH}`;
        }, 1500);
      }
      // For other 401s (e.g. not authenticated at all) let the
      // individual caller handle the error so it can decide whether
      // to redirect silently or show a form-level error.
    }

    if (status === 429) {
      // Rate limit hit show the server's message if available,
      // otherwise fall back to a generic message.
      const rateLimitMsg =
        message || "Too many requests. Please wait a moment and try again.";
      toast.error(rateLimitMsg, {
        id: "rate-limit",
        duration: 6000,
      });
    }

    // Always re-throw so callers can still catch and handle locally if needed
    return Promise.reject(error);
  }
);

export default adminApi;