import { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminAvatar from "./AdminAvatar";

export default function ProfileDropdown({ collapsed = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { admin, logout } = useAdminAuth();

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
  }

  const displayName = admin?.name || admin?.fullName || "Admin";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2.5 w-full rounded-lg transition
          ${collapsed
            ? "justify-center p-2 hover:bg-black/5 dark:hover:bg-white/5"
            : "px-2.5 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        title={collapsed ? displayName : undefined}
      >
        <AdminAvatar name={displayName} avatar={admin?.avatar} size={32} />
        {!collapsed && (
          <>
            <div className="min-w-0 text-left flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate leading-tight">
                {displayName}
              </p>
              {admin?.email && (
                <p className="text-[10px] text-gray-500 dark:text-slate-500 truncate leading-tight">
                  {admin.email}
                </p>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-slate-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className={`absolute z-50 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden
          ${collapsed ? "left-full ml-2 bottom-0 w-48" : "bottom-full mb-2 left-0 right-0"}`}
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/5">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{displayName}</p>
            {admin?.email && (
              <p className="text-xs text-gray-500 dark:text-slate-500 truncate">{admin.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
