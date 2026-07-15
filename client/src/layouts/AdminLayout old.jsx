/**
 * AdminLayout (Part 3 Prompt 08)
 *
 * Full admin shell:
 *   - TopBar (sticky): logo | Create User Login button | ProfileDropdown
 *   - AdminNav: Home + dynamic category links + drag-and-drop for custom cats
 *   - MobileMenu: slide-in overlay triggered by hamburger in AdminNav
 *   - Main content area: <Outlet /> renders the matched child page
 *
 * Changes from Prompt 07:
 *   - Adds mobileMenuOpen state + passes onMenuOpen to AdminNav
 *   - Renders <MobileMenu> at layout level so it overlays the whole page
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CategoriesProvider } from "../context/CategoriesContext";
import TopBar from "../components/admin/TopBar";
import AdminNav from "../components/admin/AdminNav";
import MobileMenu from "../components/admin/MobileMenu";

export default function AdminLayout() {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <CategoriesProvider>
      {/* Block all admin pages from search engine indexing */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* ── Top bar ─────────────────────────────────────── */}
        <TopBar onCreateUserClick={() => setShowCreateUser(true)} />

        {/* ── Horizontal category nav (desktop) + hamburger (mobile) ── */}
        <AdminNav onMenuOpen={() => setMobileMenuOpen(true)} />

        {/* ── Mobile slide-in menu ─────────────────────────── */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* ── Page content ────────────────────────────────── */}
        <main className="flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Create User modal wired in Part 6; stub for now */}
      {showCreateUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreateUser(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-80 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Create User Login
            </p>
            <p className="text-xs text-gray-400 mb-4">
              This modal will be fully wired in Part 6.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateUser(false)}
              className="text-xs px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </CategoriesProvider>
  );
}
