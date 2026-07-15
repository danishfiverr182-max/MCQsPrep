/**
 * MobileMenu (Admin Sidebar Overlay)
 *
 * Full-height slide-in sidebar for mobile (< lg breakpoint).
 * Mirrors the desktop sidebar layout and styling.
 */

import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAdminCategories } from "../../context/CategoriesContext";
import ProfileDropdown from "./ProfileDropdown";

function MobileNavItem({ to, end, icon, label, onClose }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive ? "sidebar-nav-active" : "sidebar-nav-idle"}`
      }
    >
      {icon}
      <span className="sidebar-nav-label">{label}</span>
    </NavLink>
  );
}

function MobileCatItem({ to, label, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `sidebar-cat-item ${isActive ? "sidebar-cat-active" : "sidebar-cat-idle"}`
      }
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
      <span className="truncate text-[13px]">{label}</span>
    </NavLink>
  );
}

// Icons (same as sidebar)
function OverviewIcon() {
  return (
    <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  );
}
function DashboardIcon() {
  return (
    <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0012 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function FreeMockIcon() {
  return (
    <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}


export default function MobileMenu({ isOpen, onClose, onCreateUserClick }) {
  const { categories } = useAdminCategories();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Prevent body scroll while menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const defaultCats = categories.filter((c) => !c.isDeletable);
  const customCats = categories.filter((c) => c.isDeletable);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide-in panel ────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-72 admin-sidebar-mobile
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Mobile admin navigation"
      >
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Pakistan Mock</p>
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav-section">
          <p className="sidebar-section-label">Main</p>
          <MobileNavItem to="/admin" end icon={<OverviewIcon />} label="Overview" onClose={onClose} />
          <MobileNavItem to="/admin/dashboard" end icon={<DashboardIcon />} label="Dashboard" onClose={onClose} />
          <MobileNavItem to="/admin/users" icon={<UsersIcon />} label="Users" onClose={onClose} />
          <MobileNavItem to="/admin/free-mock-tests" icon={<FreeMockIcon />} label="Free Mock Tests" onClose={onClose} />
        </nav>

        {/* Categories */}
        <div className="sidebar-nav-section border-t border-white/5 pt-3">
          <p className="sidebar-section-label">Categories</p>

          <div className="sidebar-cats-list">
            {defaultCats.map((cat) => (
              <MobileCatItem
                key={cat._id}
                to={`/admin/dashboard/category/${cat.slug}`}
                label={cat.name}
                onClose={onClose}
              />
            ))}

            {customCats.length > 0 && (
              <>
                <div className="px-3 pt-2 pb-1">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Custom</p>
                </div>
                {customCats.map((cat) => (
                  <MobileCatItem
                    key={cat._id}
                    to={`/admin/dashboard/category/${cat.slug}`}
                    label={cat.name}
                    onClose={onClose}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button
            onClick={() => { onCreateUserClick(); onClose(); }}
            className="sidebar-create-btn"
          >
            <PlusIcon />
            <span>Create User</span>
          </button>

          <div className="sidebar-profile">
            <ProfileDropdown collapsed={false} />
          </div>
        </div>
      </aside>
    </>
  );
}
