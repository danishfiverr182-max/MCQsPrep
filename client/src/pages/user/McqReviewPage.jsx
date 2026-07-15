/**
 * src/pages/user/McqReviewPage.jsx
 *
 * MCQ review page for premium test sections.
 * Route: /test/:testId/section/:sectionKey/review
 *
 * Mirrors src/public/pages/McqReviewPage.jsx but uses /api/tests/ endpoints.
 */

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import McqReviewCard from "../../public/components/McqReviewCard";
import safeStorage from "../../public/utils/safeStorage";

const SECTION_DISPLAY_NAMES = {
  verbal:    "Verbal",
  nonVerbal: "Non-Verbal",
  academic:  "Academic",
};

const LS_KEY = (testId) => `premiumTest_${testId}`;

function hasStoredResult(testId, sectionKey) {
  const progress = safeStorage.getJson(LS_KEY(testId), {});
  const entry = progress[sectionKey];
  return entry && typeof entry === "object";
}

function ReviewSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-32 bg-border dark:bg-dark-surface2 rounded mb-6" />
      <div className="h-6 w-48 bg-border dark:bg-dark-surface2 rounded mb-8" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-bg dark:bg-dark-surface2 rounded-xl mb-4" />
      ))}
    </div>
  );
}

export default function PremiumMcqReviewPage() {
  const { testId, sectionKey } = useParams();
  const location = useLocation();
  const navigate  = useNavigate();

  const [mcqs, setMcqs]               = useState([]);
  const [sectionName, setSectionName] = useState(SECTION_DISPLAY_NAMES[sectionKey] || "Section");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const answers = location.state?.answers || {};

  // Guard: no stored result → bounce to hub
  useEffect(() => {
    if (!hasStoredResult(testId, sectionKey)) {
      navigate(`/test/${testId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, sectionKey]);

  useEffect(() => {
    if (!hasStoredResult(testId, sectionKey)) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    api
      .get(`/tests/${testId}/section/${sectionKey}/review`)
      .then((res) => {
        if (cancelled) return;
        setMcqs(res.data.mcqs || []);
        setSectionName(res.data.sectionName || sectionKey);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load the review. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, sectionKey]);

  if (loading) return <ReviewSkeleton />;

  const goToHub = () => navigate(`/test/${testId}`);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 dark:bg-dark-bg">
      <button
        onClick={goToHub}
        className="inline-flex items-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition mb-6 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        ← Back to Test Hub
      </button>

      <h1 className="text-xl font-bold text-txt-primary dark:text-slate-100 mb-1">{sectionName} Review</h1>
      <p className="text-sm text-txt-secondary dark:text-slate-300 mb-8">
        Green = correct, red = your wrong pick, green outline = correct answer you missed.
      </p>

      {error && (
        <div className="bg-danger-light border border-danger/30 rounded-xl px-5 py-6 text-center mb-6 dark:bg-red-900/30 dark:border-red-500/50">
          <p className="text-sm font-semibold text-danger dark:text-red-300">{error}</p>
        </div>
      )}

      {!error &&
        mcqs.map((mcq, i) => (
          <McqReviewCard
            key={mcq._id}
            mcq={mcq}
            userAnswer={answers[mcq._id]}
            questionNumber={i + 1}
          />
        ))}

      <button
        onClick={goToHub}
        className="inline-flex items-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition mt-4 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        ← Back to Test Hub
      </button>
    </div>
  );
}
