/**
 * src/public/components/CategoryLockMessage.jsx — Premium Redesign
 *
 * Redesigned locked state with:
 *  - Gold shimmer border button for visitors
 *  - Crown icon and compelling copy
 *  - Preserved backward-compat props
 */

import { Lock } from "lucide-react";

export default function CategoryLockMessage({
  isLoggedIn,
  onBuyClick,
  renderUnlocked,
  // Backward-compat props (ignored):
  // hasAccess, userExpired, categoryName
}) {
  // ── Logged-in: show unlocked content ─────────────────────
  if (isLoggedIn) {
    return typeof renderUnlocked === "function"
      ? renderUnlocked()
      : renderUnlocked ?? null;
  }

  // ── Visitor: compelling premium CTA ──────────────────────
  return (
    <button
      type="button"
      onClick={onBuyClick}
      className="group relative w-full text-center text-sm font-bold py-2.5 rounded-xl transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(245, 197, 66, 0.1)",
        border: "1px solid rgba(245, 197, 66, 0.35)",
        color: "#F5C542",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(245, 197, 66, 0.18)";
        e.currentTarget.style.borderColor = "rgba(245, 197, 66, 0.6)";
        e.currentTarget.style.boxShadow = "0 0 16px rgba(245, 197, 66, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(245, 197, 66, 0.1)";
        e.currentTarget.style.borderColor = "rgba(245, 197, 66, 0.35)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <span className="text-base">👑</span>
        Unlock Premium Access
      </span>
    </button>
  );
}
