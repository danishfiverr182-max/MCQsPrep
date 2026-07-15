import { useEffect, useState } from "react";
import api from "../../api/axios";

const SESSION_KEY = "expiryBannerDismissed";

export default function ExpiryWarningBanner() {
  const [users,     setUsers]     = useState([]);  // [{ email, expiresAt, daysRemaining }]
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );

  useEffect(() => {
    if (dismissed) return;

    let cancelled = false;
    async function fetchExpiring() {
      try {
        const { data } = await api.get("/admin/users/expiring-soon");
        if (!cancelled && data.users?.length > 0) {
          setUsers(data.users);
        }
      } catch {
        // Silently fail banner is non-critical
      }
    }

    fetchExpiring();
    return () => { cancelled = true; };
  }, [dismissed]);

  function handleDismiss() {
    sessionStorage.setItem(SESSION_KEY, "true");
    setDismissed(true);
  }

  if (dismissed || users.length === 0) return null;

  return (
    <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-400 dark:border-amber-600/50 rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-4">

        {/* Icon + content */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {users.length} account{users.length !== 1 ? "s" : ""} expiring within 3 days
            </p>
            <ul className="space-y-1">
              {users.map((u) => (
                <li key={u.email} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600/60 dark:bg-amber-400/60 flex-shrink-0" />
                  <span className="font-medium truncate">{u.email}</span>
                  <span className="text-amber-600/70 dark:text-amber-400/60 flex-shrink-0">
                    expires in {u.daysRemaining} day{u.daysRemaining !== 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/60">
              Contact these users to renew their access before it expires.
            </p>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          title="Dismiss for this session"
          className="flex-shrink-0 text-amber-600/70 dark:text-amber-400/60 hover:text-amber-800 dark:hover:text-amber-300 transition mt-0.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}