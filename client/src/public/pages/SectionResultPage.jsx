/**
 * src/public/pages/SectionResultPage.jsx
 *
 * Free Mock Test result page — visually rebuilt to match the Premium result
 * page (src/pages/user/SectionResultPage.jsx): same circular score ring,
 * header band, pass/fail pill, and button layout. Data comes from the free
 * /submit endpoint ({ score, total, percentage, passed } — no passMarkUsed,
 * free tests always use a fixed 50% pass mark). A Buy Premium CTA is added
 * since this is the free funnel.
 *
 * Route:  /free-tests/:testId/section/:sectionKey/result
 */

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link, useOutletContext } from "react-router-dom";
import safeStorage from "../utils/safeStorage";
import { SECTION_KEYS, SECTION_DISPLAY_NAMES } from "../config/freeTestSections";

const LS_KEY = (testId) => `freeTest_${testId}`;
const FREE_PASS_MARK = 50;

// ── Circular percentage ring (identical to the premium result page) ───────
function ScoreRing({ percentage }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
        <circle cx="44" cy="44" r={radius} fill="none" strokeWidth="7" className="stroke-white/25" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-white"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-extrabold text-white tabular-nums">{percentage}%</span>
      </div>
    </div>
  );
}

export default function SectionResultPage() {
  const { testId, sectionKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { openPremiumPopup } = useOutletContext() ?? {};
  const [showConfirm, setShowConfirm] = useState(false);

  const result = location.state;

  useEffect(() => {
    if (!result) {
      navigate(`/free-tests/${testId}/hub`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!result) return null;

  const { score, total, percentage, passed } = result;
  const sectionName = result.sectionName || SECTION_DISPLAY_NAMES[sectionKey] || "Section";

  const currentIdx = SECTION_KEYS.indexOf(sectionKey);
  const nextSectionKey =
    currentIdx >= 0 && currentIdx < SECTION_KEYS.length - 1 ? SECTION_KEYS[currentIdx + 1] : null;
  const nextSectionName = nextSectionKey ? SECTION_DISPLAY_NAMES[nextSectionKey] : null;

  function handleRetry() {
    const progress = safeStorage.getJson(LS_KEY(testId), {});
    progress[sectionKey] = "inProgress";
    safeStorage.setJson(LS_KEY(testId), progress);
    navigate(`/free-tests/${testId}/section/${sectionKey}`);
  }

  function handleNextSection() {
    const progress = safeStorage.getJson(LS_KEY(testId), {});
    progress[nextSectionKey] = "inProgress";
    safeStorage.setJson(LS_KEY(testId), progress);
    navigate(`/free-tests/${testId}/section/${nextSectionKey}`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 dark:bg-dark-bg">
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden dark:bg-dark-surface dark:border-dark-border">
        {/* ── Header band ─────────────────────────────────────────────── */}
        <div className={`px-6 pt-6 pb-5 text-center ${passed ? "bg-success" : "bg-danger"}`}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/75 mb-3">
            {sectionName} Section
          </p>

          <ScoreRing percentage={percentage} />

          <p className="text-white font-bold text-lg mt-3 tabular-nums">
            {score} <span className="font-medium text-white/70">/ {total} correct</span>
          </p>

          <span
            className={`inline-flex items-center gap-1 text-xs font-bold tracking-wide px-3 py-1 rounded-full mt-3 ${
              passed ? "bg-white text-success" : "bg-white text-danger"
            }`}
          >
            {passed ? "PASSED ✓" : "FAILED ✗"}
          </span>

          <p className="text-[11px] font-bold text-slate-900 mt-2">Pass mark: {FREE_PASS_MARK}%</p>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-6">
          <p
            className={`text-sm font-semibold text-center mb-5 ${
              passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            {passed
              ? `Congratulations! You passed the ${sectionName} Section.`
              : "Better luck next time! Keep practising."}
          </p>

          {nextSectionKey && (
            <div className="mb-4 bg-brand-light border border-brand/30 rounded-xl px-4 py-3 dark:bg-blue-900/30 dark:border-blue-500/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-brand font-semibold uppercase tracking-wider dark:text-blue-300">
                    Up next
                  </p>
                  <p className="text-sm font-bold text-txt-primary dark:text-slate-100">
                    {nextSectionName} Section
                  </p>
                </div>
                <button
                  onClick={handleNextSection}
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Start →
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <Link
              to={`/free-tests/${testId}/section/${sectionKey}/review`}
              state={result}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-bold bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg transition dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Review MCQs
            </Link>

            <button
              onClick={() => navigate(`/free-tests/${testId}/hub`)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-bold bg-surface border border-border text-txt-primary hover:border-brand hover:text-brand px-4 py-2.5 rounded-lg transition dark:bg-dark-surface dark:border-dark-border dark:text-slate-200 dark:hover:border-blue-400"
            >
              Test Hub
            </button>
          </div>

          {/* ── Buy Premium CTA (free-funnel specific) ─────────────────── */}
          {openPremiumPopup && (
            <button
              onClick={() => openPremiumPopup()}
              className="w-full mb-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-navy px-4 py-2.5 rounded-lg transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #F5C542, #f09819)" }}
            >
              👑 Unlock Full Premium Tests
            </button>
          )}

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full text-xs font-semibold text-txt-muted hover:text-txt-secondary dark:text-slate-400 dark:hover:text-slate-300 underline underline-offset-2 transition"
            >
              ↺ Retry this section
            </button>
          ) : (
            <div className="bg-accent-light border border-accent/30 rounded-xl px-4 py-3 text-center dark:bg-amber-900/20 dark:border-amber-500/30">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2.5">
                This will overwrite your current result. Continue?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRetry}
                  className="text-xs font-bold bg-accent hover:bg-accent-dark text-white px-4 py-1.5 rounded-lg transition"
                >
                  Yes, retry
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-xs font-bold bg-bg hover:bg-border text-txt-secondary px-4 py-1.5 rounded-lg transition dark:bg-dark-surface2 dark:hover:bg-dark-border dark:text-slate-300"
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
