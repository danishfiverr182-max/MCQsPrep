/**
 * src/pages/user/FreeCustomTestHubPage.jsx
 *
 * Hub page for FREE standalone custom category tests (e.g. KPPSC Police   Free Test 1).
 * Route: /test/free-custom/:testId
 *
 * Identical to CustomTestHubPage, except:
 *   - Fetches GET /api/free-custom-tests/hub/:testId (no auth required)
 *   - "Start Test" → /test/free-custom/:testId/take
 *   - Shows a green "FREE" badge instead of the premium/locked styling
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import SectionInstructionsModal from "../../public/components/SectionInstructionsModal";

function formatTime(seconds) {
  if (!seconds) return " ";
  const m = Math.round(seconds / 60);
  return `${m} minute${m !== 1 ? "s" : ""}`;
}

function HubSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded mb-8" />
      <div className="h-7 w-64 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-40 bg-gray-100 dark:bg-dark-surface2 rounded mb-10" />
      <div className="h-24 bg-gray-100 dark:bg-dark-surface2 rounded-xl mb-4" />
      <div className="h-10 w-32 bg-gray-200 rounded-lg" />
    </div>
  );
}

export default function FreeCustomTestHubPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    api
      .get(`/free-custom-tests/hub/${testId}`)
      .then(({ data }) => setTestInfo(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [testId]);

  function handleModalStart() {
    setShowModal(false);
    navigate(`/test/free-custom/${testId}/take`);
  }

  if (loading) return <HubSkeleton />;

  if (notFound || !testInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-10 shadow-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
            Test not found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            This test may have been removed or is not yet published.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { displayName, groupName, categorySlug, timeLimitSeconds, totalMcqs, subjectBreakdown } =
    testInfo;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      {categorySlug && (
        <Link
          to={`/category/${categorySlug}`}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-900 transition mb-6"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {groupName || "Back"}
        </Link>
      )}

      {/* Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {groupName}
          </span>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
            Free
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-txt-primary dark:text-white">
          {displayName}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Answer all questions and submit to see your result. No login required.
        </p>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-5 space-y-3 mb-6">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Total Questions</span>
          <span className="text-sm font-bold text-gray-800 dark:text-slate-100">
            {totalMcqs ?? " "}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Time Limit</span>
          <span className="text-sm font-bold text-blue-900">
            {formatTime(timeLimitSeconds)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">Passing Mark</span>
          <span className="text-sm font-bold text-green-700">80%</span>
        </div>
      </div>

      {/* Pass-mark callout */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-8 text-sm text-yellow-800 font-medium">
        ⚡ You need <strong>80% or above</strong> to pass this test.
      </div>

      {/* Start button */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 text-sm font-bold bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition shadow-sm"
      >
        Start Test →
      </button>

      {/* Instructions popup */}
      {showModal && (
        <SectionInstructionsModal
          sectionName={displayName}
          mcqCount={totalMcqs}
          timeLimitSeconds={timeLimitSeconds}
          onStart={handleModalStart}
          onClose={() => setShowModal(false)}
          passMark="80%"
          subjectBreakdown={subjectBreakdown}
        />
      )}
    </div>
  );
}
