import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";

// ── Skeleton placeholder for loading state ────────────────────
function SkeletonLink() {
  return <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />;
}

// ── Hamburger icon ────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <div className="flex flex-col gap-1.5 w-5">
      <span className={`block h-0.5 bg-gray-700 transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
      <span className={`block h-0.5 bg-gray-700 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
      <span className={`block h-0.5 bg-gray-700 transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
    </div>
  );
}

/**
 * Navbar
 * Props:
 *   onLoginClick() opens LoginModal
 */
export default function Navbar({ onLoginClick }) {
  const { categories, loading } = useCategories();
  const { premiumUser, setPremiumUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-1 pb-0.5 border-b-2 ${
      isActive
        ? "text-blue-900 border-yellow-400"
        : "text-gray-600 border-transparent hover:text-blue-900"
    }`;

  async function handleLogout() {
    try {
      await api.post("/user/auth/logout");
    } catch {}
    setPremiumUser(null);
    toast.success("Logged out.");
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="bg-blue-900 text-white px-4 md:px-8 py-1.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-yellow-400 font-black text-lg tracking-tight">PrepPK</span>
          <span className="text-blue-200 text-xs hidden sm:inline">Mock Test Platform</span>
        </Link>

        {/* Top-bar actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/free-mock-tests"
            className="text-xs font-medium text-yellow-400 hover:text-yellow-300 transition px-3 py-1 border border-yellow-400 hover:border-yellow-300 rounded-full"
          >
            Free Mock Tests
          </Link>

          {premiumUser ? (
            /* Logged-in state */
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-200 hidden sm:inline max-w-[140px] truncate">
                {premiumUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-full transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            /* Logged-out state */
            <button
              onClick={onLoginClick}
              className="text-xs font-medium bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-3 py-1 rounded-full transition font-semibold"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* ── Main navbar ─────────────────────────────────────── */}
      <nav className="px-4 md:px-8 py-0">
        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 h-11">
          {loading ? (
            <>
              <SkeletonLink />
              <SkeletonLink />
              <SkeletonLink />
            </>
          ) : (
            categories.map((cat) => (
              <NavLink
                key={cat._id}
                to={`/category/${cat.slug}`}
                className={navLinkClass}
              >
                {cat.name}
              </NavLink>
            ))
          )}
        </div>

        {/* Mobile: hamburger button */}
        <div className="flex md:hidden items-center justify-between h-11">
          <span className="text-sm text-black font-medium">Browse Categories</span>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1"
            aria-label="Toggle menu"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ─────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {loading ? (
            <>
              <SkeletonLink />
              <SkeletonLink />
              <SkeletonLink />
            </>
          ) : (
            categories.map((cat) => (
              <NavLink
                key={cat._id}
                to={`/category/${cat.slug}`}
                className={({ isActive }) =>
                  `text-sm font-medium py-1 ${isActive ? "text-blue-900" : "text-gray-600"}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </NavLink>
            ))
          )}
          <Link
            to="/free-mock-tests"
            className="text-sm font-medium text-yellow-600 pt-1 border-t border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Free Mock Tests
          </Link>
        </div>
      )}
    </header>
  );
}
