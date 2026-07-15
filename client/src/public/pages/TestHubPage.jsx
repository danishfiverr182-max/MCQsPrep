/**
 * src/public/pages/TestHubPage.jsx  (Prompt 80 hardened)
 *
 * Changes vs Prompt 08:
 *   - All localStorage reads/writes replaced with safeStorage so the hub
 *     works correctly in private browsing mode (SecurityError fallback).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FULL END-TO-END TEST SCRIPT (Prompt 80)
 * Run this manually to verify the complete Part 8 user journey:
 *
 *  (1)  Open /free-mock-tests
 *       → Page loads, tests grouped by category, no errors.
 *
 *  (2)  Click a published free test → lands on /free-tests/:testId/hub
 *       → Three section cards render; available ones show "Start →".
 *
 *  (3)  Click "Verbal" → instructions modal opens.
 *       Click "Start Test" → navigates to /free-tests/:testId/section/verbal.
 *       → Timer starts, MCQs load, question dots render.
 *
 *  (4)  Answer a few questions, then click "Submit Test".
 *       → Navigates to /free-tests/:testId/section/verbal/result.
 *       → Score, pass/fail badge, and percentage display correctly.
 *
 *  (5)  Click "Review MCQs".
 *       → /free-tests/:testId/section/verbal/review loads with correct answers.
 *       → Green = correct, red = wrong pick, green outline = missed correct.
 *
 *  (6)  Click "← Back to Test Hub" → hub shows Verbal card as green/red
 *       (completed) with score displayed. Non-Verbal and Academic show "Start →".
 *
 *  (7)  Complete Non-Verbal section end-to-end (same flow as steps 3–6).
 *
 *  (8)  Complete Academic section end-to-end (same flow as steps 3–6).
 *       → After returning to hub, "Section Breakdown" and "Overall Pass/Fail"
 *       verdict panels appear with all three sections' scores and a total.
 *
 *  (9)  Click "Retake Full Test" → confirm dialog → "Yes, retake".
 *       → All three section cards reset to "Start →".
 *       → Overall result panel disappears.
 *       → Repeat steps 3–8 to verify the retake flow works identically.
 *
 * Edge-case checks:
 *   (A)  Refresh mid-test (during step 3) → return to hub shows "Not Started"
 *        (inProgress auto-reset) with amber "session interrupted" banner.
 *   (B)  Navigate directly to /free-tests/:testId/section/verbal/result
 *        without completing the section → redirected to hub, no crash.
 *   (C)  Navigate directly to /free-tests/:testId/section/verbal/review
 *        without completing the section → redirected to hub, no crash.
 *   (D)  Kill the backend and visit /free-mock-tests → error card, no blank screen.
 *   (E)  Open the test in a private browsing tab → full flow works (safeStorage
 *        in-memory fallback active), just without cross-tab persistence.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Route:  /free-tests/:testId/hub  (inside UserLayout)
 * Data:   GET /api/free-tests/:testId  (once per mount only)
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../api/axios";
import SectionInstructionsModal from "../components/SectionInstructionsModal";
import safeStorage from "../utils/safeStorage";
import { PageTitle, CardTitle, Label, BodyText, Muted } from "../../components/ui/Typography";

// ── safeStorage helpers ───────────────────────────────────────
const LS_KEY = (testId) => `freeTest_${testId}`;

function rawProgress(testId) {
  return safeStorage.getJson(LS_KEY(testId), {});
}

function sectionStatus(progress, key) {
  return progress[key] ?? "notStarted";
}

// ── Skeleton ──────────────────────────────────────────────────
function HubSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-32 bg-border dark:bg-dark-surface2 rounded mb-8" />
      <div className="h-7 w-56 bg-border dark:bg-dark-surface2 rounded mb-2" />
      <div className="h-4 w-40 bg-bg dark:bg-dark-surface2 rounded mb-10" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-bg dark:bg-dark-surface2 rounded-xl mb-4" />
      ))}
    </div>
  );
}

// ── Interrupted session banner ────────────────────────────────
function InterruptedBanner({ onDismiss }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 animate-fade-in">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
        Your previous session was interrupted. You can restart the section.
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-amber-500 hover:text-amber-700 transition"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Section status card ───────────────────────────────────────
function SectionCard({ section, status, onCardClick }) {
  const { sectionKey, sectionName, mcqCount, timeLimitSeconds, available } = section;
  const minutes = timeLimitSeconds > 0 ? Math.round(timeLimitSeconds / 60) : null;

  if (status === "notStarted") {
    return (
      <button
        onClick={() => available && onCardClick(section)}
        disabled={!available}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition mb-4 min-h-[56px] ${
          available
            ? "bg-surface border-2 border-border text-txt-primary hover:border-brand hover:text-brand cursor-pointer dark:bg-dark-surface dark:border-dark-border dark:text-slate-200 dark:hover:border-blue-400"
            : "bg-bg border-2 border-border text-txt-muted cursor-not-allowed dark:bg-dark-surface dark:border-dark-border dark:text-slate-500"
        }`}
      >
        <div className="text-left">
          <CardTitle as="p" className="text-sm">{sectionName}</CardTitle>
          <p className={`text-xs mt-0.5 ${available ? "text-txt-secondary dark:text-slate-400" : "text-txt-muted dark:text-slate-500"}`}>
            {available
              ? `${mcqCount} MCQs${minutes ? ` · ${minutes} min` : ""}`
              : "Coming Soon"}
          </p>
        </div>
        {available && (
          <span className="text-xs font-semibold bg-brand-light text-brand px-3 py-1 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
            Start →
          </span>
        )}
      </button>
    );
  }

  if (status === "inProgress") {
    return (
      <div className="w-full flex items-center justify-between px-5 py-4 rounded-xl border mb-4 bg-bg border-border text-txt-muted min-h-[56px] dark:bg-dark-surface dark:border-dark-border">
        <div>
          <p className="font-semibold text-sm text-txt-secondary dark:text-slate-300">{sectionName}</p>
          <p className="text-xs mt-0.5 text-txt-muted dark:text-slate-400">
            {mcqCount > 0 ? `${mcqCount} MCQs` : ""}
          </p>
        </div>
        <span className="text-xs font-semibold text-txt-muted bg-border px-3 py-1 rounded-full dark:bg-dark-surface2 dark:text-slate-400">
          In Progress…
        </span>
      </div>
    );
  }

  if (status && typeof status === "object") {
    const { score, total, passed } = status;
    return (
      <div
        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border mb-4 min-h-[56px] ${
          passed ? "bg-success-light border-success dark:bg-green-900/30 dark:border-green-500" : "bg-danger-light border-danger dark:bg-red-900/30 dark:border-red-500"
        }`}
      >
        <div>
          <p className={`font-semibold text-sm ${passed ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
            {sectionName}
          </p>
          <p className={`text-xs mt-0.5 ${passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
            Score: {score} / {total}
          </p>
        </div>
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
    );
  }

  return null;
}

// ── Tick / Cross icons ────────────────────────────────────────
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

// ── Overall result panel ──────────────────────────────────────
function OverallResultPanel({ sections, progress, onRetryAll }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const resultsMap = {};
  for (const s of sections) {
    const st = progress[s.sectionKey];
    if (!st || typeof st !== "object") return null;
    resultsMap[s.sectionKey] = st;
  }

  const failedSections = sections.filter((s) => !resultsMap[s.sectionKey]?.passed);
  const overallPassed  = failedSections.length === 0;
  const totalScore     = sections.reduce((sum, s) => sum + (resultsMap[s.sectionKey]?.score ?? 0), 0);
  const totalMCQs      = sections.reduce((sum, s) => sum + (resultsMap[s.sectionKey]?.total ?? 0), 0);

  return (
    <div className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-muted dark:text-slate-400 mb-3">
        Section Breakdown
      </h2>
      <div className="rounded-xl border border-border bg-surface overflow-hidden mb-4 dark:bg-dark-surface dark:border-dark-border">
        {sections.map((s, i) => {
          const r    = resultsMap[s.sectionKey];
          const pct  = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
          const last = i === sections.length - 1;
          return (
            <div
              key={s.sectionKey}
              className={`flex items-center justify-between px-5 py-3.5 ${
                !last ? "border-b border-border dark:border-dark-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {r.passed ? <TickIcon /> : <CrossIcon />}
                <div>
                  <p className="text-sm font-bold text-txt-primary dark:text-slate-100">{s.sectionName}</p>
                  <p className="text-xs text-txt-muted dark:text-slate-400">{pct}%</p>
                </div>
              </div>
              <span
                className={`text-sm font-bold tabular-nums ${
                  r.passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                }`}
              >
                {r.score} / {r.total}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between px-5 py-3 bg-bg border-t border-border dark:bg-dark-surface2 dark:border-dark-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-txt-secondary dark:text-slate-400">Total</p>
          <span className="text-sm font-black text-txt-primary tabular-nums dark:text-slate-100">
            {totalScore} / {totalMCQs}
          </span>
        </div>
      </div>

      {/* Verdict card */}
      <div
        className={`rounded-xl p-6 text-white ${
          overallPassed ? "bg-success" : "bg-danger"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/20">
            {overallPassed ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <p
              className={`text-lg font-black uppercase tracking-wide ${
                overallPassed ? "text-white" : "text-white"
              }`}
            >
              Overall {overallPassed ? "Pass" : "Fail"}
            </p>
            {overallPassed ? (
              <p className="text-sm text-white mt-0.5">
                Congratulations! You passed all sections.
              </p>
            ) : (
              <p className="text-sm text-white mt-0.5">
                {failedSections.map((s) => s.sectionName).join(", ")}{" "}
                {failedSections.length === 1 ? "did" : "did"} not reach 50%.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-dashed border-white/30">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition ${
                overallPassed
                  ? "bg-white/15 hover:bg-white/25 text-white"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.635 15A9 9 0 1018.364 9" />
              </svg>
              Retake Full Test
            </button>
          ) : (
            <div className="bg-surface border border-border rounded-xl px-4 py-4 dark:bg-dark-surface dark:border-dark-border">
              <p className="text-sm font-semibold text-txt-primary dark:text-slate-100 mb-3">
                This will reset all three sections and clear your current results. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowConfirm(false); onRetryAll(); }}
                  className="text-sm font-bold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Yes, retake
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm font-bold bg-bg hover:bg-border text-txt-secondary px-4 py-2 rounded-lg transition dark:bg-dark-surface2 dark:hover:bg-dark-border dark:text-slate-300"
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

  const [test, setTest]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [progress, setProgress]     = useState({});
  const [showBanner, setShowBanner] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  /**
   * readSectionStatuses reads safeStorage, resets any 'inProgress'
   * values to 'notStarted', writes the corrected state back, and returns
   * the cleaned progress object.
   */
  const readSectionStatuses = useCallback((id) => {
    const current = rawProgress(id);
    let hadStale = false;
    const cleaned = { ...current };

    for (const key of Object.keys(cleaned)) {
      if (cleaned[key] === "inProgress") {
        cleaned[key] = "notStarted";
        hadStale = true;
      }
    }

    if (hadStale) {
      safeStorage.setJson(LS_KEY(id), cleaned);
      setShowBanner(true);
    }

    return cleaned;
  }, []);

  // ── First mount: fetch test metadata ──────────────────────────
  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    setNotFound(false);

    api
      .get(`/free-tests/${testId}`)
      .then((res) => {
        setTest(res.data);
        setProgress(readSectionStatuses(testId));
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [testId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-read safeStorage on every navigation back ──────────────
  useEffect(() => {
    if (!testId || loading) return;
    setProgress(readSectionStatuses(testId));
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for cross-tab storage changes ──────────────────────
  useEffect(() => {
    function onStorage(e) {
      if (e.key === LS_KEY(testId)) setProgress(readSectionStatuses(testId));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [testId, readSectionStatuses]);

  // Auto-dismiss banner after 5 s
  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  function handleSectionClick(section) {
    setActiveSection(section);
  }

  function handleModalStart() {
    if (!activeSection) return;
    const { sectionKey } = activeSection;
    const updated = { ...rawProgress(testId), [sectionKey]: "inProgress" };
    safeStorage.setJson(LS_KEY(testId), updated);
    setProgress(updated);
    setActiveSection(null);
    navigate(`/free-tests/${testId}/section/${sectionKey}`);
  }

  function handleModalClose() {
    setActiveSection(null);
  }

  function handleRetryAll() {
    safeStorage.removeItem(LS_KEY(testId));
    setProgress({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Render ────────────────────────────────────────────────────
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
            to="/free-mock-tests"
            className="inline-flex items-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg transition"
          >
            ← Back to Free Mock Tests
          </Link>
        </div>
      </div>
    );
  }

  if (!test) return null;

  return (
    <>
      <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto py-10 dark:bg-dark-bg">
        {/* Back link */}
        <Link
          to="/free-mock-tests"
          className="inline-flex items-center gap-1 text-xs text-txt-muted hover:text-brand transition mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Free Mock Tests
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 bg-accent-light border border-accent/30 px-3 py-1 rounded-full mb-3">
            Free Test
          </span>
          <PageTitle as="h1" className="text-2xl md:text-3xl">{test.title}</PageTitle>
          <BodyText className="text-sm mt-1">
            Select a section to begin. Each section is timed independently.
          </BodyText>
        </div>

        {/* Interrupted session banner */}
        {showBanner && <InterruptedBanner onDismiss={() => setShowBanner(false)} />}

        {/* Section cards */}
        <div>
          {test.sections.map((section) => (
            <SectionCard
              key={section.sectionKey}
              section={section}
              status={sectionStatus(progress, section.sectionKey)}
              onCardClick={handleSectionClick}
            />
          ))}
        </div>

        {/* Overall result panel */}
        <OverallResultPanel
          sections={test.sections}
          progress={progress}
          onRetryAll={handleRetryAll}
        />
      </div>

      {activeSection && (
        <SectionInstructionsModal
          sectionName={activeSection.sectionName}
          mcqCount={activeSection.mcqCount}
          timeLimitSeconds={activeSection.timeLimitSeconds}
          onStart={handleModalStart}
          onClose={handleModalClose}
          subjectBreakdown={activeSection.subjectBreakdown}
        />
      )}
    </>
  );
}
