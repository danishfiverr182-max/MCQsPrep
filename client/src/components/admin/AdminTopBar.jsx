import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminTopBar({ onCreateUserClick }) {
  const { adminUser, setAdminUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    try {
      await api.post("/admin/auth/logout");
    } catch {}
    setAdminUser(null);
    toast.success("Logged out.");
    navigate("/admin/login");
  }

  const initials = adminUser?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-indigo-950 text-white px-6 py-2 flex items-center justify-end gap-4">
      {/* Create User Login button */}
      <button
        onClick={onCreateUserClick}
        className="text-xs font-semibold bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-3 py-1.5 rounded-lg transition"
      >
        + Create User Login
      </button>

      {/* Admin profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium hidden sm:inline">{adminUser?.fullName}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-800 truncate">{adminUser?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
