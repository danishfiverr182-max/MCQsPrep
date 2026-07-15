/**
 * useCategories  (Prompt 09)
 *
 * Fetches public categories from GET /api/categories on mount.
 * On success: returns the live list sorted by order (as returned by the API).
 * On failure: falls back to the 3 default category stubs so the homepage
 *             never shows a broken/empty state (graceful degradation).
 *
 * The hook is intentionally lightweight no context, no cache layer  
 * because the backend adds Cache-Control: public, max-age=60 so the
 * browser handles repeat requests efficiently.
 */

import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

// ── Static fallback shown when the API is unreachable ────────
const FALLBACK_CATEGORIES = [
  { _id: "fallback-army",  name: "Pakistan Army Tests",   slug: "pakistan-army-tests",   order: 0 },
  { _id: "fallback-navy",  name: "Pakistan Navy Tests",   slug: "pakistan-navy-tests",   order: 1 },
  { _id: "fallback-paf",   name: "Pakistan Air Force Tests", slug: "pakistan-air-force-tests", order: 2 },
];

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .get("/categories")
      .then((res) => {
        // API returns an array; guard against unexpected shapes
        const data = Array.isArray(res.data) ? res.data : [];
        setCategories(data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Failed to load categories.";
        setError(msg);
        // Graceful degradation: show the 3 default names so the page
        // is still usable even when the backend is temporarily down.
        setCategories(FALLBACK_CATEGORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
