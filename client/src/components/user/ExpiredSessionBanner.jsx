/**
 * src/components/user/ExpiredSessionBanner.jsx  (Prompt 3   new file)
 *
 * Renders a dismissible banner at the top of every page when the user's
 * premium access has expired (sessionExpired === true in AuthContext).
 *
 * The banner persists across page navigations until:
 *  (a) The user clicks the × dismiss button, or
 *  (b) The user logs in again with a renewed account (AuthContext resets the flag).
 *
 * The WhatsApp link points to the admin contact number set in VITE_ADMIN_WHATSAPP.
 * Falls back to a generic WhatsApp URL if the env var is not set.
 */

import { useAuth } from "../../context/AuthContext";

const ADMIN_WHATSAPP =
  import.meta.env.VITE_ADMIN_WHATSAPP ||
  "https://wa.me/923000000000"; // fallback   override in .env

export default function ExpiredSessionBanner() {
  const { sessionExpired, clearExpiredSession } = useAuth();

  if (!sessionExpired) return null;

  return (
    <div className="w-full bg-red-600 dark:bg-red-900/30 dark:border-b dark:border-red-700 text-white dark:text-red-300 text-sm px-4 py-2.5 flex items-center justify-between gap-3 z-50">
      <p className="flex-1 text-center">
        <span className="font-semibold">Your premium access has expired.</span>{" "}
        <a
          href={ADMIN_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-red-100 dark:hover:text-red-200 transition-colors"
        >
          Contact admin on WhatsApp to renew.
        </a>
      </p>
      <button
        onClick={clearExpiredSession}
        aria-label="Dismiss expiry banner"
        className="flex-shrink-0 text-white/80 dark:text-red-300/80 hover:text-white dark:hover:text-red-200 text-xl leading-none px-1"
      >
        ×
      </button>
    </div>
  );
}
