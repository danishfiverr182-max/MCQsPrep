/**
 * TopBar (Admin Dashboard)
 *
 * Slim contextual top bar:
 *   - LEFT: hamburger (mobile only) + breadcrumb-style page title
 *   - RIGHT: quick search (future) + notifications placeholder
 *
 * "Create User" and ProfileDropdown have moved to the sidebar.
 */

import { useLocation } from "react-router-dom";
import AdminThemeToggle from "../../components/ui/AdminThemeToggle";

// Map route paths to readable page titles
function getPageTitle(pathname) {
  if (pathname === "/admin") return "Overview";
  if (pathname === "/admin/dashboard") return "Dashboard";
  if (pathname === "/admin/users") return "Users";
  if (pathname === "/admin/free-mock-tests") return "Free Mock Tests";
  if (pathname.includes("/admin/dashboard/category/")) {
    const slug = pathname.split("/admin/dashboard/category/")[1]?.split("/")[0];
    return slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Category";
  }
  if (pathname.includes("/admin/custom-test/")) return "Custom Test Editor";
  if (pathname.includes("/admin/free-mock-test/")) return "Free Mock Test Editor";
  return "Admin";
}

export default function TopBar({ onMenuOpen }) {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="admin-topbar">
      <div className="flex items-center gap-3">
        {/* ── Hamburger (mobile only) ──────────────────────── */}
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* ── Page title ───────────────────────────────────── */}
        <div>
          <h1 className="text-base font-semibold text-white leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* ── Right side: date/time + theme toggle ──────────────────────────── */}
      <div className="flex items-center gap-3">
        <AdminThemeToggle />
        <span className="text-xs text-slate-500 hidden sm:block">
          {new Date().toLocaleDateString("en-PK", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </header>
  );
}
