/**
 * pages/admin/FreeMockTestsPage.jsx  (Part 5 Prompt 02 + 07)
 *
 * Central hub for Free Mock Test management.
 *
 * Prompt 07 additions:
 *  - Each category card now has a 'View Tests' chevron button.
 *  - Clicking it lazy-loads GET /api/admin/free-mock-tests/categories/:slug/tests
 *    and expands a FreeMockTestTable below the card.
 *  - Results are cached in local state re-expanding does NOT re-fetch.
 *  - Collapse on second click.
 *  - Pagination: Prev / Next controls inside the table (only when totalPages > 1).
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import FreeMockCategoryDropdown from "../../components/admin/FreeMockCategoryDropdown";
import FreeMockTestTable from "../../components/admin/FreeMockTestTable";
import FreeMockGroupPanel from "../../components/admin/FreeMockGroupPanel";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

// ── Accent colours per category slug ─────────────────────────
const ACCENT = {
  "pak-army": "border-success",
  "pak-navy": "border-blue-500",
  "pak-air-force": "border-sky-400",
};

function accentClass(slug) {
  return ACCENT[slug] || "border-amber-500";
}

// ── Loading skeleton (page-level) ─────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-surface border border-border border-l-4 border-l-txt-muted rounded-xl p-5 animate-pulse">
      <div className="h-5 w-40 bg-bg rounded mb-2" />
      <div className="h-3.5 w-28 bg-bg rounded mb-5" />
      <div className="h-9 w-44 bg-bg rounded-lg" />
    </div>
  );
}

// ── Chevron icon ──────────────────────────────────────────────
function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

// ── Status icon for grouped free-test rows (custom categories) ──
function FreeTestStatusIcon({ status }) {
  if (status === "published") {
    return (
      <span className="text-success" title="Published">
        ✓
      </span>
    );
  }
  return (
    <span className="text-amber-400" title="In progress">
      ⏳
    </span>
  );
}

function DeleteIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

// ── One free test link + delete button (custom category listing) ──
function FreeTestChip({ groupName, test, onDeleted }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await api.delete(`/free-mock-tests/custom/${test._id}`);
      setDialogOpen(false);
      toast.success(`Free Test ${test.testNumber} deleted successfully`);
      onDeleted(test);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete free test.");
      setDeleting(false);
    }
  }

  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Link
          to={`/admin/free-mock-test/custom/${test._id}`}
          className="text-txt-secondary hover:text-accent text-xs transition flex items-center gap-1"
        >
          Free Test {test.testNumber}{" "}
          <FreeTestStatusIcon status={test.status} />
        </Link>
        <button
          onClick={() => setDialogOpen(true)}
          title="Delete this test"
          className="text-danger/70 hover:text-danger transition"
        >
          <DeleteIcon />
        </button>
      </span>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={`Delete ${groupName} Free Test ${test.testNumber}?`}
        message="This will permanently delete this free test and all its MCQs. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDialogOpen(false)}
      />
    </>
  );
}

// ── Custom category card: group panel + grouped free-test listing ──
function CustomCategoryFreeMockCard({ cat }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [summary, setSummary] = useState(null); // { groups: [...] }
  const [loadingSummary, setLoadingSummary] = useState(true);

  const fetchSummary = useCallback(() => {
    setLoadingSummary(true);
    api
      .get(`/admin/free-mock-tests/custom/summary/${cat.slug}`)
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary({ groups: [] }))
      .finally(() => setLoadingSummary(false));
  }, [cat.slug]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Refresh the listing whenever the panel closes, since a new free test
  // may have just been created/published from inside it.
  function handlePanelClose() {
    setPanelOpen(false);
    fetchSummary();
  }

  const groups = summary?.groups ?? [];

  // Remove a deleted test locally and shift the testNumber of every other
  // test in the same group that came after it down by 1, mirroring the
  // renumbering the server now does on delete.
  function handleTestDeleted(deletedTest) {
    setSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.map((g) => {
          const containsDeleted = g.tests.some((t) => t._id === deletedTest._id);
          if (!containsDeleted) return g;
          return {
            ...g,
            tests: g.tests
              .filter((t) => t._id !== deletedTest._id)
              .map((t) =>
                t.testNumber > deletedTest.testNumber
                  ? { ...t, testNumber: t.testNumber - 1 }
                  : t
              ),
          };
        }),
      };
    });
  }

  return (
    <div
      className={`bg-surface border border-border border-l-4 ${accentClass(cat.slug)} rounded-xl hover:border-border transition`}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-txt-primary">
              {cat.name}
            </h3>
            <p className="text-xs text-txt-secondary mt-0.5">
              Custom category · single-section free tests · Group → Test → MCQs
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className={`shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition ${
              panelOpen
                ? "bg-accent text-white"
                : "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30"
            }`}
          >
            <span className="text-base leading-none">
              {panelOpen ? "−" : "+"}
            </span>
            Add {cat.name} Free Test
          </button>

          {panelOpen && (
            <FreeMockGroupPanel category={cat} onClose={handlePanelClose} />
          )}
        </div>
      </div>

      {/* Grouped listing: "Police → Free Test 1 ✓, Free Test 2 ⏳" */}
      <div className="border-t border-border/60 px-5 py-4">
        {loadingSummary ? (
          <div className="h-4 w-48 bg-bg rounded animate-pulse" />
        ) : groups.length === 0 ? (
          <p className="text-xs text-txt-muted">No free test groups yet.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div key={g._id} className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-txt-secondary shrink-0">
                  {g.name} →
                </span>
                {g.tests.length === 0 ? (
                  <span className="text-txt-muted text-xs italic">
                    No free tests yet
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {g.tests.map((t) => (
                      <FreeTestChip
                        key={t._id}
                        groupName={g.name}
                        test={t}
                        onDeleted={handleTestDeleted}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Single category card with expandable test table ───────────

function CategoryCard({ cat }) {
  // Expansion state
  const [expanded, setExpanded] = useState(false);

  // Per-category test cache: { tests, total, totalPages } keyed by page
  const [cache, setCache] = useState({}); // { [page]: { tests, total, totalPages } }
  const [page, setPage] = useState(1);
  const [loadingTests, setLoadingTests] = useState(false);
  const [testError, setTestError] = useState(null);

  // Derived: current page data (or null if not yet fetched)
  const currentData = cache[page] || null;

  // ── Fetch tests for a given page (lazy + cached) ─────────
  const fetchTests = useCallback(
    async (targetPage) => {
      if (cache[targetPage]) return; // already cached
      setLoadingTests(true);
      setTestError(null);
      try {
        const res = await api.get(
          `/admin/free-mock-tests/categories/${cat.slug}/tests`,
          { params: { page: targetPage, limit: 10 } },
        );
        setCache((prev) => ({
          ...prev,
          [targetPage]: {
            tests: res.data.tests,
            total: res.data.total,
            totalPages: res.data.totalPages,
          },
        }));
      } catch (err) {
        setTestError(err.response?.data?.message || "Failed to load tests.");
      } finally {
        setLoadingTests(false);
      }
    },
    [cat.slug, cache],
  );

  // ── Toggle expansion, fetch page 1 on first open ─────────
  function handleToggle() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      fetchTests(1);
    }
  }

  // ── Pagination handlers ───────────────────────────────────
  function handlePrevPage() {
    const newPage = page - 1;
    setPage(newPage);
    fetchTests(newPage);
  }

  function handleNextPage() {
    const newPage = page + 1;
    setPage(newPage);
    fetchTests(newPage);
  }

  const totalPages = currentData?.totalPages ?? 1;

  return (
    <div
      className={`bg-surface border border-border border-l-4 ${accentClass(cat.slug)}
    rounded-xl hover:border-border transition`}
    >
      {/* ── Card header ──────────────────────────────────── */}
      <div className="p-5 flex flex-col gap-4">
        {/* Top row: name + badge + chevron */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-txt-primary">
              {cat.name}
            </h3>
            <p className="text-xs text-txt-secondary mt-0.5">
              {cat.publishedCount === 0
                ? "No free mock tests published yet"
                : `${cat.publishedCount} free mock test${cat.publishedCount !== 1 ? "s" : ""} published`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* In-progress badge */}
            {cat.hasInProgress && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium
                px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                In Progress
              </span>
            )}

            {/* View Tests chevron button */}
            <button
              type="button"
              onClick={handleToggle}
              title={expanded ? "Collapse tests" : "View tests"}
              className="flex items-center gap-1.5 text-xs font-medium text-txt-secondary
                hover:text-txt-primary border border-border hover:border-txt-muted
                px-2.5 py-1.5 rounded-lg transition focus:outline-none"
            >
              {expanded ? "Hide" : "View Tests"}
              <ChevronIcon open={expanded} />
            </button>
          </div>
        </div>

        {/* Dropdown trigger */}
        <div>
          <FreeMockCategoryDropdown slug={cat.slug} categoryName={cat.name} />
        </div>
      </div>

      {/* ── Expanded test table ───────────────────────────── */}
      {expanded && (
        <div className="border-t border-border/60 px-5 py-4">
          {testError ? (
            <div
              className="flex items-center gap-2 text-sm text-danger bg-danger-light/10
              border border-danger/20 rounded-xl px-4 py-3"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {testError}
              <button
                type="button"
                onClick={() => {
                  setCache({});
                  fetchTests(page);
                }}
                className="ml-auto text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <FreeMockTestTable
              tests={currentData?.tests ?? []}
              loading={loadingTests && !currentData}
              slug={cat.slug}
              page={page}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function FreeMockTestsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/free-mock-tests");
      setCategories(res.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Free Mock Tests
          </h1>
          <span
            className="text-xs font-semibold uppercase tracking-widest
            px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25"
          >
            Admin
          </span>
        </div>
        <p className="text-sm text-txt-secondary">
          Manage free mock tests for each category.
        </p>

        {/* No-sharing rule notice */}
        <div
          className="mt-4 flex items-start gap-3 bg-brand/10 border border-blue-500/20
          rounded-xl px-4 py-3"
        >
          <svg
            className="w-4 h-4 text-brand mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
            />
          </svg>
          <p className="text-xs text-blue-600 font-bold leading-relaxed">
            <span className="font-semibold text-red-600">
              No sharing in Free Mock Tests.
            </span>{" "}
            Unlike premium tests, every category gets its own completely
            independent MCQs for Verbal, Non-Verbal, and Academic sections.
            Sections are never shared across categories.
          </p>
        </div>
      </div>

      {/* ── Error state ─────────────────────────────────────── */}
      {error && (
        <div
          className="mb-6 flex items-center gap-3 bg-danger-light/10 border border-danger/20
          rounded-xl px-4 py-3 text-sm text-danger"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
          <button
            type="button"
            onClick={loadCategories}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Category list (full-width, stacked) ─────────────── */}
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : categories.map((cat) =>
              cat.isDefault === false ? (
                <CustomCategoryFreeMockCard key={cat._id} cat={cat} />
              ) : (
                <CategoryCard key={cat._id} cat={cat} />
              ),
            )}
      </div>

      {/* ── Empty state ─────────────────────────────────────── */}
      {!loading && !error && categories.length === 0 && (
        <div className="text-center py-20 text-txt-muted text-sm">
          No categories found. Add categories from the Admin Dashboard first.
        </div>
      )}
    </div>
  );
}
