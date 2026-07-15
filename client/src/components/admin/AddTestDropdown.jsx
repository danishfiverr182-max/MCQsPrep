/**
 * AddTestDropdown.jsx  (Part 4 Prompt 02)
 *
 * Dynamic dropdown for the "Add [Category] Test" button.
 *
 * Behaviour:
 *  - On click: POSTs to /api/admin/categories/:slug/tests to get or create
 *    the in-progress test and its section status.
 *  - Renders exactly ONE option based on `nextRequired`:
 *      'verbal'    → 'Add Verbal Section'
 *      'nonVerbal' → 'Add Non-Verbal Section'
 *      'academic'  → 'Add Academic Section'
 *  - If `nextRequired` is 'complete', shows a 'View Test' link instead of a dropdown.
 *  - Closes on outside click (useEffect + document listener) or Escape key.
 *  - Shows a small spinner while the API call is in-flight.
 *
 * Props:
 *  category  Category object with at minimum { name, slug }
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ChevronDownIcon({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Section label map ─────────────────────────────────────────

const SECTION_LABELS = {
  verbal:    "Add Verbal Section",
  nonVerbal: "Add Non-Verbal Section",
  academic:  "Add Academic Section",
};

const SECTION_ROUTES = {
  verbal:    "add-verbal",
  nonVerbal: "add-nonverbal",
  academic:  "add-academic",
};

// ── Component ─────────────────────────────────────────────────

export default function AddTestDropdown({ category }) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [testData, setTestData]     = useState(null); // { testId, nextRequired }
  const [error, setError]           = useState("");

  // ── Close on outside click or Escape ──────────────────────
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // ── Button click POST to create/find in-progress test ───
  const handleButtonClick = useCallback(async () => {
    // If already loaded and dropdown is open, just close
    if (open) {
      setOpen(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post(`/admin/categories/${category.slug}/tests`);
      setTestData(data);
      setOpen(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load test data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [open, category.slug]);

  // ── Navigate to section creation page ─────────────────────
  const handleSectionClick = useCallback(() => {
    if (!testData) return;
    const sectionRoute = SECTION_ROUTES[testData.nextRequired];
    navigate(
      `/admin/dashboard/category/${category.slug}/test/${testData.testId}/${sectionRoute}`
    );
    setOpen(false);
  }, [testData, category.slug, navigate]);

  // ── If all sections done: show 'View Test' link instead ───
  if (testData?.nextRequired === "complete") {
    return (
      <Link
        to={`/admin/dashboard/category/${category.slug}/test/${testData.testId}/view`}
        className="inline-flex items-center gap-2 bg-success hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400/50"
      >
        <EyeIcon />
        View Test
      </Link>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* ── Trigger button ──────────────────────────────────── */}
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {loading ? <Spinner /> : <PlusIcon />}
        Add {category.name} Test
        {!loading && <ChevronDownIcon open={open} />}
      </button>

      {/* ── Error message (inline, below button) ─────────────── */}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-danger bg-surface border border-danger/30 rounded-lg px-3 py-2 whitespace-nowrap z-50">
          {error}
        </p>
      )}

      {/* ── Dropdown panel ───────────────────────────────────── */}
      {open && testData && testData.nextRequired !== "complete" && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-xs text-txt-secondary font-medium uppercase tracking-wider">
              Next Step
            </p>
          </div>

          <button
            onClick={handleSectionClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-txt-primary hover:bg-bg/60 hover:text-txt-primary transition-colors duration-100 text-left"
          >
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            {SECTION_LABELS[testData.nextRequired]}
          </button>
        </div>
      )}
    </div>
  );
}
