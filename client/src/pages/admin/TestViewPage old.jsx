/**
 * TestViewPage  (Prompt 08)
 *
 * Read-only admin preview of a test.
 * Route: /admin/dashboard/category/:slug/test/:testId/view
 *
 * Fetches GET /api/admin/tests/:testId/full and displays all three
 * sections in a tab layout (Verbal | Non-Verbal | Academic).
 *
 * Each tab shows:
 *   - Time limit + MCQ count
 *   - All MCQs via MCQDisplayCard (correct answer highlighted green)
 *   - A 'Print Section' button that calls window.print()
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import adminApi from "../../api/adminApi";
import MCQDisplayCard from "../../components/admin/MCQDisplayCard";

// ── Helpers ───────────────────────────────────────────────────

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return " ";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m}m ${s}s`;
}

// ── Section tab content ───────────────────────────────────────

function SectionView({ section }) {
  if (!section) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Section data unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Meta row ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Time Limit:</span>
          <span className="text-white font-medium">{formatTime(section.timeLimit)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>MCQ Count:</span>
          <span className="text-white font-medium">{section.totalMCQs ?? section.mcqs?.length ?? 0}</span>
        </div>

        <button
          onClick={() => window.print()}
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Section
        </button>
      </div>

      {/* ── Print-only meta ──────────────────────────────── */}
      <div className="hidden print:block text-sm text-gray-700 mb-4 pb-2 border-b border-gray-300">
        Time Limit: {formatTime(section.timeLimit)} &nbsp;|&nbsp; MCQ Count:{" "}
        {section.totalMCQs ?? section.mcqs?.length ?? 0}
      </div>

      {/* ── MCQ list ─────────────────────────────────────── */}
      {section.mcqs && section.mcqs.length > 0 ? (
        <div className="space-y-4">
          {section.mcqs.map((mcq, i) => (
            <MCQDisplayCard key={mcq._id || i} mcq={mcq} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 text-sm">
          No MCQs found for this section.
        </div>
      )}
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────

const TABS = [
  { key: "verbal",    label: "Verbal" },
  { key: "nonVerbal", label: "Non-Verbal" },
  { key: "academic",  label: "Academic" },
];

// ── Main page ─────────────────────────────────────────────────

export default function TestViewPage() {
  const { slug, testId } = useParams();

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("verbal");

  const fetchTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.get(`/api/admin/tests/${testId}/full`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load test.");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => { fetchTest(); }, [fetchTest]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded" />
        <div className="h-4 w-32 bg-gray-700 rounded" />
        <div className="h-10 w-full bg-gray-800 rounded-2xl" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-40 bg-gray-800/60 rounded-2xl border border-gray-700" />
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-gray-800 border border-red-500/30 rounded-2xl p-10 space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <Link
            to={`/admin/dashboard/category/${slug}`}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Category
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const categoryName = data.category?.name || "Category";
  const isPublished  = data.isPublished;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          nav, header, aside, footer, [data-print-hide] { display: none !important; }
          body { background: white !important; color: black !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4" data-print-hide>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-black">
              {categoryName} Test {data.testNumber}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                isPublished
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : "text-gray-400 bg-gray-400/10 border-gray-400/20"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-green-400" : "bg-gray-400"}`} />
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <Link
            to={`/admin/dashboard/category/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Category
          </Link>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block mb-4 pb-2 border-b border-gray-400">
          <h1 className="text-lg font-bold text-black">
            {categoryName} Test {data.testNumber}  {" "}
            {TABS.find((t) => t.key === activeTab)?.label} Section
          </h1>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div
          className="flex gap-1 bg-gray-800/60 border border-gray-700 rounded-2xl p-1"
          data-print-hide
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-xl transition-colors duration-150 ${
                activeTab === tab.key
                  ? "bg-gray-700 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Active section ────────────────────────────────── */}
        <SectionView section={data.sections?.[activeTab]} />
      </div>
    </>
  );
}
