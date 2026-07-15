/**
 * src/api/axios.js
 *
 * Mirrors the interceptor pattern used by the web client
 * (client/src/api/axios.js), adapted for a token-header auth flow instead
 * of cookies. RN has no automatic cookie jar the way a browser does, so the
 * mobile app authenticates every request with an `Authorization: Bearer
 * <token>` header instead of `withCredentials`.
 *
 * This file only sets up the instance + interceptor placeholders. Real
 * token storage/retrieval (SecureStore) and real 401/403 handling
 * (auth-clear, navigation) land in Part 3 once the auth context exists.
 */

import axios from "axios";

import { API_BASE_URL } from "../utils/config";

// ── Axios instance ──────────────────────────────────────────────────────────
// All API routes on the server are mounted under `/api`, same as the web
// client's baseURL convention (see client/src/api/axios.js).
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// ── Request interceptor ─────────────────────────────────────────────────────
// TODO Part 3: attach real token
// Once the auth context/SecureStore wrapper exists, read the stored token
// here and set `config.headers.Authorization = \`Bearer ${token}\`;` before
// the request goes out.
api.interceptors.request.use(
  (config) => {
    // TODO Part 3: attach real token
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────────────────
// TODO Part 3: real handling — clear stored token, reset auth context, and
// redirect to the login screen via the navigation ref. For now just log so
// we can see the shape of these errors during early development.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // eslint-disable-next-line no-console
      console.log(
        `[api] ${status} received on ${error.config?.url} — TODO Part 3: handle global auth redirect`,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default api;
