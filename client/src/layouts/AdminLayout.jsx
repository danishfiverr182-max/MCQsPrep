/**
 * AdminLayout
 *
 * Modern sidebar + main content shell:
 *   - Sidebar (left): logo, nav links, categories, profile — collapsible
 *   - TopBar (sticky): hamburger (mobile) + page context
 *   - Main content area: <Outlet /> renders the matched child page
 */

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CategoriesProvider } from "../context/CategoriesContext";
import { AdminThemeProvider } from "../context/AdminThemeContext";
import AdminSidebar from "../components/admin/AdminNav";
import AdminTopBar from "../components/admin/TopBar";
import MobileMenu from "../components/admin/MobileMenu";
import CreateUserModal from "../components/admin/CreateUserModal";

export default function AdminLayout() {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <AdminThemeProvider>
      <CategoriesProvider>
      {/* Block all admin pages from search engine indexing */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="admin-shell">
        {/* ── Sidebar (desktop) ──────────────────────────────── */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          onCreateUserClick={() => setShowCreateUser(true)}
        />

        {/* ── Mobile sidebar overlay ─────────────────────────── */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onCreateUserClick={() => setShowCreateUser(true)}
        />

        {/* ── Main area ──────────────────────────────────────── */}
        <div className="admin-main">
          {/* ── Top bar ────────────────────────────────────── */}
          <AdminTopBar
            onMenuOpen={() => setMobileMenuOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* ── Page content ──────────────────────────────── */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Create User modal ────────────────────────────────── */}
      {showCreateUser && (
        <CreateUserModal onClose={() => setShowCreateUser(false)} />
      )}
    </CategoriesProvider>
    </AdminThemeProvider>
  );
}
