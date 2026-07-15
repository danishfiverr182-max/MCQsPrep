/**
 * src/pages/user/TestHubPage.jsx  (Prompt 5   Overall Result Screen)
 *
 * Hub page for CATEGORY (premium) tests e.g. Army Test 1, Navy Test 2.
 * Route: /test/:testId
 *
 * What changed in Prompt 5:
 *  - Section button states now sourced from the DATABASE (GET /api/results/:testId/:sectionType)
 *    so they persist correctly across browser refreshes.
 *  - localStorage is still used as a fast-load cache and to track "inProgress"
 *    state, but the authoritative source for completed sections is the DB.
 *  - When all sections are complete, calls GET /api/results/overall/:testId and
 *    renders the Overall Result card (green pass banner or red fail banner).
 *  - "Retake Test" button clears both localStorage and triggers a fresh DB fetch.
 *
 * Data fetched:
 *   GET /api/tests/:testId                         → test metadata + section list
 *   GET /api/results/:testId/:sectionType          → per-section result (once per section)
 *   GET /api/results/overall/:testId               → overall result (when all complete)
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import SectionInstructionsModal from "../../public/components/SectionInstructionsModal";
import safeStorage from "../../public/utils/safeStorage";
import { PageTitle, CardTitle, BodyText } from "../../components/ui/Typography";

// ── Storage helpers ───────────────────────────────────────────
const LS_KEY = (testId) => `premiumTest_${testId}`;

function rawProgress(testId) {
  return safeStorage.getJson(LS_KEY(testId), {});
}

// ── Skeleton ──────────────────────────────────────────────────
function HubSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-28 bg-border dark:bg-dark-surface2 rounded mb-8" />
      <div className="h-7 w-52 bg-border dark:bg-dark-surface2 rounded mb-2" />
      <div className="h-4 w-36 bg-bg dark:bg-dark-surface2 rounded mb-10" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-bg dark:bg-dark-surface2 rounded-xl mb-4" />
      ))}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────
/**
 * Status values:
 *  "notStarted"  → navy Start button
 *  "inProgress"  → grey Resume button
 *  { score, total, percentage, passed, resultId } → green/red completed card
 */
function SectionCard({ section, status, onStart }) {
  const { sectionKey, sectionName, mcqCount, timeLimitSeconds, available } = section;
  const minutes = timeLimitSeconds > 0 ? Math.round(timeLimitSeconds / 60) : null;

  // Unavailable (no questions yet)
  if (!available) {
    return (
      <div className="w-full flex items-center justify-between px-5 py-4 rounded-xl border mb-4 bg-bg border-border text-txt-muted cursor-not-allowed min-h-[56px] dark:bg-dark-surface dark:border-dark-border">
        <div>
          <CardTitle as="p" className="text-sm">{sectionName}</CardTitle>
          <p className="text-xs mt-0.5">Coming Soon</p>
        </div>
        <span className="text-xs font-semibold bg-border text-txt-muted px-3 py-1 rounded-full dark:bg-dark-surface2 dark:text-slate-400">
          Unavailable
        </span>
      </div>
    );
  }

  // Completed   sourced from DB
  if (status && typeof status === "object") {
    const { score, total, percentage, passed, resultId } = status;
    return (
      <div
        className={`w-full px-6 py-4 rounded-xl border-2 mb-4 transition ${
          passed
            ? "bg-success-light border-success dark:bg-green-900/30 dark:border-green-500"
            : "bg-danger-light border-danger dark:bg-red-900/30 dark:border-red-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-semibold text-sm ${passed ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
              {sectionName}
            </p>
            <p className={`text-xs mt-0.5 ${passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
              Score: {score}/{total} · {percentage}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Pass / Fail badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                passed
                  ? "bg-success text-white"
                  : "bg-danger text-white"
              }`}
            >
              {passed ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Passed
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Failed
                </>
              )}
            </span>
          </div>
        </div>

        {/* Retake link */}
        <button
          onClick={() => onStart(section)}
          className={`mt-3 text-xs font-semibold underline underline-offset-2 transition ${
            passed ? "text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-200" : "text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200"
          }`}
        >
          Retake section →
        </button>
      </div>
    );
  }

  // Not started / inProgress
  return (
    <button
      onClick={() => onStart(section)}
      className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 mb-4 bg-surface border-border text-txt-primary hover:border-brand hover:text-brand transition text-left min-h-[56px] dark:bg-dark-surface dark:border-dark-border dark:text-slate-200 dark:hover:border-blue-400"
    >
      <div>
        <p className="font-semibold text-sm">{sectionName}</p>
        <p className="text-xs mt-0.5 text-txt-secondary dark:text-slate-400">
          {mcqCount} MCQs{minutes ? ` · ${minutes} min` : ""}
        </p>
      </div>
      <span className="text-xs font-semibold bg-brand-light text-brand px-3 py-1 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
        {status === "inProgress" ? "Resume →" : "Start →"}
      </span>
    </button>
  );
}

// ── Icons ──────────────────────────────────────────────────────
function TickIcon() {
  return (
    <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg className="w-4 h-4 text-danger shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ── Overall Result Panel ──────────────────────────────────────
/**
 * Displayed only when overallData is loaded (all sections complete).
 * overallData shape: { sections, overallPassed, totalSections, passedSections }
 */
function OverallResultPanel({ overallData, onRetake }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!overallData) return null;

  const { sections, overallPassed, passedSections, totalSections } = overallData;
  const failedSections = sections.filter((s) => !s.passed);

  const totalScore  = sections.reduce((sum, s) => sum + s.score, 0);
  const totalMcqs   = sections.reduce((sum, s) => sum + s.totalMcqs, 0);

  return (
    <div className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-muted dark:text-slate-400 mb-3">
        Overall Result
      </h2>

      {/* Section breakdown table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden mb-4 shadow-sm dark:bg-dark-surface dark:border-dark-border">
        {sections.map((s, i) => {
          const last = i === sections.length - 1;
          return (
            <div
              key={s.sectionType}
              className={`flex items-center justify-between px-5 py-3.5 ${
                !last ? "border-b border-border dark:border-dark-border" : ""
              } ${!s.passed ? "bg-danger-light dark:bg-red-900/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                {s.passed ? <TickIcon /> : <CrossIcon />}
                <div>
                  <p className="text-sm font-bold text-txt-primary dark:text-slate-100">{s.sectionName}</p>
                  <p className="text-xs text-txt-muted dark:text-slate-400">{s.percentage}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.passed
                      ? "bg-success-light text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-danger-light text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {s.passed ? "Pass" : "Fail"}
                </span>
                <span className="text-sm font-bold tabular-nums text-txt-secondary dark:text-slate-300">
                  {s.score} / {s.totalMcqs}
                </span>
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div className="flex items-center justify-between px-5 py-3 bg-bg border-t border-border dark:bg-dark-surface2 dark:border-dark-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-txt-secondary dark:text-slate-400">
            Total · {passedSections}/{totalSections} sections passed
          </p>
          <span className="text-sm font-black text-txt-primary tabular-nums dark:text-slate-100">
            {totalScore} / {totalMcqs}
          </span>
        </div>
      </div>

      {/* Verdict banner */}
      <div
        className={`rounded-xl p-6 shadow-sm text-white ${
          overallPassed ? "bg-success" : "bg-danger"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className="mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/20"
          >
            {overallPassed ? (
              /* Trophy icon for pass */
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 21h8m-4-4v4M5 3H3a2 2 0 000 4c0 2.21 1.79 4 4 4h10c2.21 0 4-1.79 4-4a2 2 0 000-4h-2M5 3h14M5 3v4m14-4v4" />
              </svg>
            ) : (
              /* X icon for fail */
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <div>
            <p className="text-lg font-black uppercase tracking-wide text-white">
              {overallPassed ? "You Passed the Test!" : "Test Not Passed"}
            </p>
            {overallPassed ? (
              <p className="text-sm text-white mt-0.5">
                Well done   you met the 50% pass mark in every section.
              </p>
            ) : (
              <div className="mt-1">
                <p className="text-sm text-white">
                  Keep practising! The following{" "}
                  {failedSections.length === 1 ? "section" : "sections"} did not reach 50%:
                </p>
                <ul className="mt-1 space-y-0.5">
                  {failedSections.map((s) => (
                    <li key={s.sectionType} className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <CrossIcon />
                      {s.sectionName} ({s.percentage}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Retake button */}
        <div className="mt-5 pt-4 border-t border-dashed border-white/30">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition bg-white/15 hover:bg-white/25 text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 15A9 9 0 1018.364 9" />
              </svg>
              Retake Test
            </button>
          ) : (
            <div className="bg-surface border border-border rounded-xl px-4 py-4">
              <p className="text-sm font-semibold text-txt-primary mb-3">
                This will reset all sections and clear your current results. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowConfirm(false); onRetake(); }}
                  className="text-sm font-bold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition"
                >
                  Yes, retake
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm font-bold bg-bg hover:bg-border text-txt-secondary px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function TestHubPage() {
  const { testId }  = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [test, setTest]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]       = useState("");

  // progress: { [sectionKey]: "notStarted" | "inProgress" | { score, total, percentage, passed } }
  const [progress, setProgress] = useState({});

  // Loading state for DB result lookups per section
  const [resultsLoading, setResultsLoading] = useState(false);

  // Overall result from the API (set when all sections complete)
  const [overallData, setOverallData]   = useState(null);
  const [overallLoading, setOverallLoading] = useState(false);

  // Instructions modal
  const [modal, setModal] = useState(null);

  // Track whether we've already done the DB fetch for this mount
  const dbFetchedRef = useRef(false);

  // ── Step 1: Load test metadata ────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    setNotFound(false);
    setError("");
    dbFetchedRef.current = false;

    api
      .get(`/tests/${testId}`)
      .then((res) => setTest(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else setError("Failed to load test details. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [testId]);

  // ── Step 2: Once test is loaded, fetch section results from DB ─
  // This is the authoritative source   localStorage is only an optimistic cache.
  useEffect(() => {
    if (!test || !testId || dbFetchedRef.current) return;
    dbFetchedRef.current = true;

    const availableSections = test.sections.filter((s) => s.available);
    if (availableSections.length === 0) return;

    // Build initial progress from localStorage (shows stale completed data instantly)
    const lsProgress = rawProgress(testId);
    // Reset any inProgress to notStarted
    const initialProgress = { ...lsProgress };
    for (const key of Object.keys(initialProgress)) {
      if (initialProgress[key] === "inProgress") {
        initialProgress[key] = "notStarted";
      }
    }
    setProgress(initialProgress);

    // Fetch each section's latest result from the DB in parallel
    setResultsLoading(true);

    const fetches = availableSections.map((s) =>
      api
        .get(`/results/${testId}/${s.sectionKey}`)
        .then((res) => ({ sectionKey: s.sectionKey, data: res.data }))
        .catch(() => ({ sectionKey: s.sectionKey, data: null })) // 404 = not attempted
    );

    Promise.all(fetches).then((results) => {
      const dbProgress = { ...initialProgress };

      for (const { sectionKey, data } of results) {
        if (data) {
          // DB has a result for this section   use it as the authoritative state
          dbProgress[sectionKey] = {
            score:      data.score,
            total:      data.totalMcqs,
            percentage: data.percentage,
            passed:     data.passed,
            passMarkUsed: data.passMarkUsed,
            resultId:   data._id,
          };
        } else {
          // No DB result   keep as notStarted (don't override with stale LS data)
          if (typeof dbProgress[sectionKey] === "object") {
            // Stale LS data but no DB result   clear it
            dbProgress[sectionKey] = "notStarted";
          }
        }
      }

      // Write corrected state back to localStorage
      safeStorage.setJson(LS_KEY(testId), dbProgress);
      setProgress(dbProgress);
      setResultsLoading(false);

      // Check if all available sections are now complete
      const allComplete = availableSections.every(
        (s) => typeof dbProgress[s.sectionKey] === "object"
      );
      if (allComplete) {
        fetchOverall();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, testId]);

  // ── Re-fetch DB results on navigation back to this page ───────
  // (e.g. user submits a section and navigates back to hub)
  const prevLocationKey = useRef(location.key);
  useEffect(() => {
    if (prevLocationKey.current === location.key) return;
    prevLocationKey.current = location.key;

    if (!test || !testId) return;

    // Reset the flag so the above effect can re-run
    dbFetchedRef.current = false;
    // Trigger re-fetch by pretending the test just loaded again
    // We do this by bumping a counter that the effect above depends on
    setTest((t) => (t ? { ...t } : t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // ── Fetch overall result from DB ──────────────────────────────
  const fetchOverall = useCallback(() => {
    if (!testId) return;
    setOverallLoading(true);
    setOverallData(null);

    api
      .get(`/results/overall/${testId}`)
      .then((res) => setOverallData(res.data))
      .catch(() => setOverallData(null))
      .finally(() => setOverallLoading(false));
  }, [testId]);

  // ── Retake: clear LS + reset server results + reset all state ─
  const handleRetake = useCallback(() => {
    safeStorage.removeItem(LS_KEY(testId));
    setProgress({});
    setOverallData(null);
    setOverallLoading(false);
    dbFetchedRef.current = false;

    api
      .delete(`/results/reset/${testId}`)
      .catch(() => {});

    // Re-run DB fetch (progress is now empty so all sections show notStarted)
    setTest((t) => (t ? { ...t } : t));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [testId]);

  // ── Modal handlers ────────────────────────────────────────────
  const handleStartSection = useCallback((section) => {
    setModal({ section });
  }, []);

  const handleModalStart = useCallback(() => {
    if (!modal) return;
    const { sectionKey } = modal.section;

    // Mark inProgress in storage
    const prev = rawProgress(testId);
    const updated = { ...prev, [sectionKey]: "inProgress" };
    safeStorage.setJson(LS_KEY(testId), updated);
    setProgress((p) => ({ ...p, [sectionKey]: "inProgress" }));

    setModal(null);
    navigate(`/test/${testId}/section/${sectionKey}`);
  }, [modal, testId, navigate]);

  // ── Render: loading ───────────────────────────────────────────
  if (loading) return <HubSkeleton />;

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center dark:bg-dark-bg">
        <div className="bg-surface border border-border rounded-2xl p-10 shadow-sm dark:bg-dark-surface dark:border-dark-border">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-txt-primary dark:text-slate-100 mb-2">Test not found</h2>
          <p className="text-sm text-txt-secondary dark:text-slate-300 mb-6">
            This test may have been removed or is no longer available.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-surface border border-danger/30 rounded-2xl p-10 shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-txt-primary mb-2">Something went wrong</h2>
          <p className="text-sm text-txt-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg transition"
          >
            ↻ Retry
          </button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const categorySlug = test.category?.slug;
  const categoryName = test.category?.name ?? "Tests";
  const availableSections = test.sections.filter((s) => s.available);
  const allComplete = availableSections.length > 0 &&
    availableSections.every((s) => typeof progress[s.sectionKey] === "object");

  return (
    <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto py-10 dark:bg-dark-bg">
      {categorySlug && (
        <Link
          to={`/category/${categorySlug}`}
          className="inline-flex items-center gap-1 text-xs text-txt-muted hover:text-brand transition mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {categoryName}
        </Link>
      )}

      {/* Heading */}
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand bg-brand-light px-3 py-1 rounded-full mb-3">
          {categoryName}
        </span>
        <PageTitle as="h1" className="text-2xl md:text-3xl">{test.title}</PageTitle>
        <BodyText className="text-sm mt-1">
          Select a section to begin. Complete all sections to see your overall result.
        </BodyText>
      </div>

      {/* Section cards with DB-backed states */}
      <div className="relative">
        {resultsLoading && (
          <div className="absolute inset-0 bg-surface/60 rounded-xl z-10 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
        {test.sections.map((section) => (
          <SectionCard
            key={section.sectionKey}
            section={section}
            status={progress[section.sectionKey] ?? "notStarted"}
            onStart={handleStartSection}
          />
        ))}
      </div>

      {/* Overall result   shown once all sections are complete */}
      {allComplete && (
        overallLoading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-txt-muted">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Calculating overall result…
          </div>
        ) : overallData ? (
          <OverallResultPanel overallData={overallData} onRetake={handleRetake} />
        ) : (
          // Fallback: DB call failed   compute locally from progress
          <LocalOverallPanel progress={progress} sections={test.sections} onRetake={handleRetake} />
        )
      )}

      {/* Instructions modal */}
      {modal && (
        <SectionInstructionsModal
          sectionName={modal.section.sectionName}
          mcqCount={modal.section.mcqCount}
          timeLimitSeconds={modal.section.timeLimitSeconds}
          onStart={handleModalStart}
          onClose={() => setModal(null)}
          subjectBreakdown={modal.section.subjectBreakdown}
        />
      )}
    </div>
  );
}

// ── Fallback: compute overall result locally if DB call fails ──
function LocalOverallPanel({ progress, sections, onRetake }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const available = sections.filter((s) => s.available);
  const results   = available.map((s) => progress[s.sectionKey]).filter(
    (r) => r && typeof r === "object"
  );

  if (results.length !== available.length) return null;

  const overallPassed  = results.every((r) => r.passed);
  const failedNames    = available
    .filter((s) => !progress[s.sectionKey]?.passed)
    .map((s) => s.sectionName);

  return (
    <div className="mt-10">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-muted mb-3">
        Overall Result
      </h2>
      <div
        className={`rounded-xl p-6 shadow-sm text-white ${
          overallPassed ? "bg-success" : "bg-danger"
        }`}
      >
        <p className="text-lg font-black uppercase tracking-wide text-white">
          {overallPassed ? "You Passed the Test! Well done." : "Test Not Passed. Keep practising!"}
        </p>
        {!overallPassed && (
          <p className="text-sm text-white mt-1">
            Failed: {failedNames.join(", ")}
          </p>
        )}
        <div className="mt-5 pt-4 border-t border-dashed border-white/30">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition bg-white/15 hover:bg-white/25 text-white"
            >
              Retake Test
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(false); onRetake(); }}
                className="text-sm font-bold bg-white text-brand-dark hover:bg-bg px-4 py-2 rounded-lg transition"
              >
                Yes, retake
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-sm font-bold bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
