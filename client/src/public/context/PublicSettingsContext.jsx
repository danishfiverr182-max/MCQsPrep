/**
 * src/public/context/PublicSettingsContext.jsx  (Prompt 65)
 *
 * Fetches GET /api/settings/contact once at the PublicLayout level and
 * shares { phone, whatsappNumber, email } with every public component
 * (Footer, PremiumPopup, etc.) via React context.
 *
 * On any API failure the context returns empty-string defaults so the
 * footer degrades gracefully rather than crashing.
 *
 * Usage:
 *   import { usePublicSettings } from "../../public/context/PublicSettingsContext";
 *   const { phone, whatsappNumber, email, loading } = usePublicSettings();
 */

import { createContext, useContext, useEffect, useState } from "react";
import api from "../../api/axios";

const DEFAULTS = { phone: "", whatsappNumber: "", email: "" };

const PublicSettingsContext = createContext(DEFAULTS);

// ── Provider ──────────────────────────────────────────────────
export function PublicSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/settings/contact")
      .then((res) => {
        if (!cancelled) {
          setSettings({
            phone:          res.data.phone          || "",
            whatsappNumber: res.data.whatsappNumber || "",
            email:          res.data.email          || "",
          });
        }
      })
      .catch(() => {
        // Silently degrade footer will hide the contact row
        if (!cancelled) setSettings(DEFAULTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <PublicSettingsContext.Provider value={{ ...settings, loading }}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────
export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}
