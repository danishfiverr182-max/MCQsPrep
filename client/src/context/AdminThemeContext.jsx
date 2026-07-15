import { createContext, useContext, useEffect, useState } from "react";

const ADMIN_THEME_STORAGE_KEY = "adminTheme";

const AdminThemeContext = createContext(undefined);

function getInitialAdminTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "dark";
}

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialAdminTheme);

  // Sync the `dark` class on <html> — this works together with
  // the public ThemeContext so both panels share the same CSS hooks.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (ctx === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return ctx;
}

export default AdminThemeContext;