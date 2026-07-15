/**
 * FreeMockTestViewPage  (Part 5 Prompt 08)
 *
 * Read-only admin preview of a Free Mock Test.
 * Route: /admin/free-mock-tests/:slug/test/:testId/view
 *
 * Fetches GET /api/admin/free-mock-tests/:testId/full and displays all
 * three sections in a tab layout (Verbal | Non-Verbal | Academic).
 * Structurally identical to Part 4's TestViewPage reuses
 * MCQDisplayCard.jsx from Part 4 without modification.
 *
 * Each tab shows:
 *   - Time limit + MCQ count
 *   - All MCQs via MCQDisplayCard (correct answer highlighted green)
 *   - A 'Print Section' button that calls window.print()
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/axios";
import MCQDisplayCard from "../../../components/admin/MCQDisplayCard";

// ── Helpers ───────────────────────────────────────────────────

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return " ";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// MCQDisplayCard (Part 4) expects { correctIndex, imageUrl, ... }  
// FreeMockSection MCQs now store the same shape directly, so no
// mapping is needed. Kept as a passthrough in case fields diverge again.
function mapMcq(mcq) {
  return { ...mcq };
}

// ── Section tab content ───────────────────────────────────────

function SectionView({ section }) {
  if (!section) {
    return (
      <div className="text-center py-12 text-txt-muted text-sm">
        Section data unavailable.
      </div>
    );
  }

  const mcqs = section.mcqs || [];

  return (
    <div className="space-y-5">
      {/* ── Meta row ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2 text-sm text-txt-secondary">
          <svg className="w-4 h-4 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Time Limit:</span>
          <span className="text-txt-primary font-medium">{formatTime(section.timeLimit)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-txt-secondary">
          <svg className="w-4 h-4 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>MCQ Count:</span>
          <span className="text-txt-primary font-medium">{section.totalMCQs ?? mcqs.length}</span>
        </div>

        <button
          onClick={() => window.print()}
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary bg-bg/50 hover:bg-bg border border-border/50 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Section
        </button>
      </div>

      {/* ── Print-only meta ──────────────────────────────── */}
      <div className="hidden print:block text-sm text-txt-primary mb-4 pb-2 border-b border-txt-secondary">
        Time Limit: {formatTime(section.timeLimit)} &nbsp;|&nbsp; MCQ Count:{" "}
        {section.totalMCQs ?? mcqs.length}
      </div>

      {/* ── MCQ list ─────────────────────────────────────── */}
      {mcqs.length > 0 ? (
        <div className="space-y-4">
          {mcqs.map((mcq, i) => (
            <MCQDisplayCard key={mcq._id || i} mcq={mapMcq(mcq)} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-txt-muted text-sm">
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

export default function FreeMockTestViewPage() {
  const { slug, testId } = useParams();

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("verbal");

  const fetchTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/free-mock-tests/${testId}/full`);
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
        <div className="h-6 w-48 bg-bg rounded" />
        <div className="h-4 w-32 bg-bg rounded" />
        <div className="h-10 w-full bg-surface rounded-2xl" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-40 bg-surface/60 rounded-2xl border border-border" />
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-surface border border-danger/30 rounded-2xl p-10 space-y-4">
          <p className="text-danger text-sm">{error}</p>
          <Link
            to="/admin/free-mock-tests"
            className="text-xs text-txt-secondary hover:text-txt-primary transition-colors"
          >
            ← Back to Free Mock Tests
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
              {categoryName} Free Mock Test {data.testNumber}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                isPublished
                  ? "text-success bg-success-light/10 border-success/20"
                  : "text-txt-secondary bg-txt-muted/10 border-txt-muted/20"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-success-light" : "bg-txt-muted"}`} />
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <Link
            to="/admin/free-mock-tests"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Free Mock Tests
          </Link>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block mb-4 pb-2 border-b border-txt-muted">
          <h1 className="text-lg font-bold text-black">
            {categoryName} Free Mock Test {data.testNumber}  {" "}
            {TABS.find((t) => t.key === activeTab)?.label} Section
          </h1>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div
          className="flex gap-1 bg-surface/60 border border-border rounded-2xl p-1"
          data-print-hide
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-xl transition-colors duration-150 ${
                activeTab === tab.key
                  ? "bg-bg text-txt-primary shadow-sm"
                  : "text-txt-secondary hover:text-txt-primary hover:bg-bg/50"
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
