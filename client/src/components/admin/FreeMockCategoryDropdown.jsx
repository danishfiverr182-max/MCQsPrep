/**
 * components/admin/FreeMockCategoryDropdown.jsx  (Part 5 Prompt 02)
 *
 * Sub-dropdown for a single category card on the Free Mock Tests page.
 *
 * Behaviour:
 *  1. User clicks "Add Free Mock Test" button.
 *  2. Component calls POST /api/admin/free-mock-tests/categories/:slug/start.
 *  3. Based on nextRequired returned, shows exactly ONE section option:
 *       verbal    → "Add Verbal Section"
 *       nonVerbal → "Add Non-Verbal Section"
 *       academic  → "Add Academic Section"
 *       complete  → no dropdown; shows "View Test" link instead.
 *  4. Clicking the option navigates to the appropriate creation route.
 *  5. Closes on outside click.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ── Section label map ─────────────────────────────────────────
const SECTION_LABELS = {
  verbal:    "Add Verbal Section",
  nonVerbal: "Add Non-Verbal Section",
  academic:  "Add Academic Section",
};

// ── Route builder ─────────────────────────────────────────────
function sectionRoute(slug, testId, nextRequired) {
  const typeMap = {
    verbal:    "add-verbal",
    nonVerbal: "add-nonverbal",
    academic:  "add-academic",
  };
  return `/admin/free-mock-tests/${slug}/test/${testId}/${typeMap[nextRequired]}`;
}

export default function FreeMockCategoryDropdown({ slug, categoryName }) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState(null); // result from /start
  const [error, setError]     = useState(null);

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Button click: call /start, then open dropdown ─────────
  async function handleButtonClick() {
    // If already open, just close
    if (open) {
      setOpen(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        `/admin/free-mock-tests/categories/${slug}/start`
      );
      setTestData(res.data);
      setOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load test status.");
    } finally {
      setLoading(false);
    }
  }

  // ── Navigate to section creation page ────────────────────
  function handleSectionClick() {
    if (!testData) return;
    setOpen(false);
    navigate(sectionRoute(slug, testData.testId, testData.nextRequired));
  }

  // ── Navigate to view page when complete ──────────────────
  function handleViewClick() {
    if (!testData) return;
    setOpen(false);
    navigate(`/admin/free-mock-tests/${slug}/test/${testData.testId}/view`);
  }

  const isComplete = testData?.nextRequired === "complete";

  return (
    <div ref={wrapperRef} className="relative">
      {/* ── Trigger button ─────────────────────────────────── */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg
          bg-amber-500 hover:bg-amber-400 text-white
          disabled:opacity-60 disabled:cursor-not-allowed
          transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-surface"
      >
        {loading ? (
          <>
            {/* Spinner */}
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              />
            </svg>
            Loading…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Free Mock Test
          </>
        )}
      </button>

      {/* ── Error message ──────────────────────────────────── */}
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}

      {/* ── Dropdown panel ────────────────────────────────── */}
      {open && testData && (
        <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-txt-secondary">
              {categoryName} Test #{testData.testNumber}
            </p>
          </div>

          {isComplete ? (
            /* All sections done show View Test */
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-success-light/10 border border-success/20">
                <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-success font-medium">All sections complete</span>
              </div>
              <button
                type="button"
                onClick={handleViewClick}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  text-txt-primary hover:bg-bg transition text-left"
              >
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m0 0l3-3m-3 3l3 3M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
                View Test
              </button>
            </div>
          ) : (
            /* Show the single available section option */
            <div className="p-3">
              {/* Section status indicators */}
              <div className="space-y-1.5 mb-3">
                {["verbal", "nonVerbal", "academic"].map((key) => {
                  const status = testData.sections[key].status;
                  const isNext = testData.nextRequired === key;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                        ${status === "complete"
                          ? "text-success bg-success-light/10"
                          : isNext
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            : "text-txt-muted bg-bg/40"
                        }`}
                    >
                      {status === "complete" ? (
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isNext ? (
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3-3 3M6 12h10" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                      <span className="font-medium">
                        {key === "verbal" ? "Verbal" : key === "nonVerbal" ? "Non-Verbal" : "Academic"}
                      </span>
                      <span className={`ml-auto capitalize ${status === "complete" ? "text-success" : isNext ? "text-amber-300" : "text-txt-muted"}`}>
                        {status === "complete" ? "Done" : isNext ? "Next" : "Locked"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action button */}
              <button
                type="button"
                onClick={handleSectionClick}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold
                  bg-amber-500 hover:bg-amber-400 text-white transition"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {SECTION_LABELS[testData.nextRequired]}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
