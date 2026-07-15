/**
 * src/public/components/PremiumAccessGate.jsx  (Prompt 5   Remove Category Lock System)
 *
 * Changes:
 *  - Removed Gate 3: the "authenticated but no category access" check that called
 *    premiumUser.hasAccessTo(slug) and redirected with { noAccess: true }.
 *    All logged-in, non-expired premium users now have access to every test.
 *  - Gate order is now:
 *      1. Auth loading → render nothing (prevents flash-redirect)
 *      2. Not authenticated → redirect to /category/:slug with { openLogin: true }
 *      3. Authenticated but expired → redirect to /category/:slug with { expired: true }
 *      4. All checks passed → render children
 *  - The category slug fetch (GET /api/tests/:testId) is retained so we know
 *    where to redirect unauthenticated/expired users.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";

export default function PremiumAccessGate({ children }) {
  const { testId } = useParams();
  const navigate   = useNavigate();
  const { premiumUser, isLoading: authLoading } = useAuth();

  // null = still fetching, string = resolved slug, false = fetch failed
  const [categorySlug, setCategorySlug] = useState(null);
  const [fetchDone,    setFetchDone]    = useState(false);

  // Fetch the test's category slug so we know where to redirect if the gate fires.
  // The endpoint is public and fast.
  useEffect(() => {
    if (!testId) return;

    api
      .get(`/tests/${testId}`)
      .then((res) => {
        setCategorySlug(res.data?.category?.slug ?? false);
      })
      .catch(() => {
        // Test not found or network error   let children render (hub shows its own 404).
        setCategorySlug(false);
      })
      .finally(() => setFetchDone(true));
  }, [testId]);

  // Wait for both auth check and test fetch before evaluating.
  if (authLoading || !fetchDone) {
    return null;
  }

  // If we couldn't determine the category (test not found / network error),
  // pass through   the hub will show its own error / 404 UI.
  if (categorySlug === false) {
    return children;
  }

  const redirectTo = `/category/${categorySlug}`;

  // ── Gate 1: not authenticated ──────────────────────────────
  if (!premiumUser) {
    navigate(redirectTo, {
      replace: true,
      state: { openLogin: true },
    });
    return null;
  }

  // ── Gate 2: authenticated but expired ─────────────────────
  // isExpired may be a virtual method on the Mongoose doc (server) or a
  // plain boolean set by the /me endpoint; handle both shapes.
  const isExpired =
    typeof premiumUser.isExpired === "function"
      ? premiumUser.isExpired()
      : premiumUser.expiresAt && new Date(premiumUser.expiresAt) < new Date();

  if (isExpired) {
    navigate(redirectTo, {
      replace: true,
      state: { expired: true },
    });
    return null;
  }

  // ── All checks passed   render the hub / test page ─────────
  return children;
}
