/**
 * CategoriesContext (Part 3 Admin Dashboard)
 *
 * Fetches categories once from GET /api/admin/categories on layout
 * mount and makes the list available to every admin page via context.
 * Child pages call useAdminCategories() no re-fetching on navigation.
 *
 * Provides:
 *   categories          array sorted by order
 *   loading             true while first fetch is in flight
 *   error               error message string or null
 *   refresh             function to manually re-fetch (used after add/delete)
 *   refreshCategories   alias for refresh (used by AddCategoryDropdown)
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/admin/categories protected by verifyAdmin on the server.
      // The admin JWT httpOnly cookie is sent automatically (withCredentials).
      const { data } = await api.get(`/admin/categories?t=${Date.now()}`);
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        refresh: fetchCategories,
        // Explicit alias so components can import by either name
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useAdminCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useAdminCategories must be used inside <CategoriesProvider>");
  }
  return ctx;
}
