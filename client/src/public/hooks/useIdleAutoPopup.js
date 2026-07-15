/**
 * src/public/hooks/useIdleAutoPopup.js  (Prompt 67)
 *
 * Starts a 30-second idle timer on every new page visit (route change).
 * When the timer fires it calls openPremiumPopup() from UserLayout.
 *
 * Rules:
 *  - Timer resets on every location.pathname change (new page = fresh 30s)
 *  - If the popup is opened manually before the timer fires (e.g. visitor
 *    clicks a locked test), the pending timer is cancelled immediately
 *  - After the popup fires (auto or manual) it will NOT re-trigger again
 *    for the same page visit tracked via a per-page `firedRef`
 *  - If the visitor closes the auto-popup and stays on the same page,
 *    the timer does NOT restart for that page visit
 *  - Skipped entirely if the visitor is already logged in (premiumUser truthy)
 *
 * @param {Function} openPremiumPopup - from UserLayout
 * @param {boolean}  isPopupOpen      - current showPremium state from UserLayout
 * @param {boolean}  isLoggedIn       - true when premiumUser exists
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const IDLE_DELAY_MS = 30_000; // 30 seconds

export default function useIdleAutoPopup(openPremiumPopup, isPopupOpen, isLoggedIn) {
  const location = useLocation();
  const timerRef = useRef(null);

  // Track whether we've already fired (auto OR manual) on this page visit.
  // Resets to false on every pathname change.
  const firedRef = useRef(false);

  // ── Reset + start a fresh timer on every route change ──────
  useEffect(() => {
    // Reset fired flag for the new page
    firedRef.current = false;

    // Never show for logged-in users
    if (isLoggedIn) return;

    // Clear any leftover timer from the previous page
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Guard: don't fire if already fired on this page
      if (firedRef.current) return;
      firedRef.current = true;
      openPremiumPopup({ mode: "visitor" });
    }, IDLE_DELAY_MS);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancel the timer if the popup is opened manually ───────
  // When isPopupOpen flips true before the timer fires, we kill the timer
  // and mark firedRef so the auto-trigger won't fire even if somehow called.
  useEffect(() => {
    if (isPopupOpen) {
      clearTimeout(timerRef.current);
      firedRef.current = true; // suppress any late-firing timer callback
    }
  }, [isPopupOpen]);
}
