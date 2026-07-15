/**
 * src/public/components/FreeTestCard.jsx  (Part 8 Prompt 01)
 *
 * Single test card rendered on the Free Mock Tests listing page.
 * Shows test title, section status pills, MCQ count, and a Start Test button.
 *
 * Props:
 *   test: {
 *     _id: string,
 *     testNumber: number,
 *     title: string,
 *     totalMCQs: number,
 *     sections: {
 *       verbal:    { status: "complete" | "pending" },
 *       nonVerbal: { status: "complete" | "pending" },
 *       academic:  { status: "complete" | "pending" },
 *     }
 *   }
 */

import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";

// ── Section status pill ───────────────────────────────────────
function SectionPill({ label, status }) {
  const ready = status === "complete";
  return <Badge variant={ready ? "success" : "muted"}>{label}</Badge>;
}

export default function FreeTestCard({ test }) {
  const hasAnySection =
    test.sections.verbal.status    === "complete" ||
    test.sections.nonVerbal.status === "complete" ||
    test.sections.academic.status  === "complete";

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-4 flex items-center justify-between gap-4">
      {/* Left: title + section pills */}
      <div className="min-w-0">
        <p className="text-txt-primary dark:text-slate-100 font-semibold mb-1.5">{test.title}</p>
        <div className="flex flex-wrap gap-1.5">
          <SectionPill label="Verbal"     status={test.sections.verbal.status} />
          <SectionPill label="Non-Verbal" status={test.sections.nonVerbal.status} />
          <SectionPill label="Academic"   status={test.sections.academic.status} />
          {test.totalMCQs > 0 && (
            <Badge variant="info">{test.totalMCQs} MCQs</Badge>
          )}
        </div>
      </div>

      {/* Right: Start Test button */}
      <div className="shrink-0">
        {hasAnySection ? (
          <Link
            to={`/free-tests/${test._id}/hub`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-success dark:bg-green-600 hover:bg-success-dark dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            {/* Play icon */}
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Start Test
          </Link>
        ) : (
          <span className="inline-block text-xs font-semibold text-txt-muted dark:text-slate-500 bg-bg dark:bg-dark-surface2 border border-border dark:border-dark-border px-4 py-2 rounded-lg cursor-not-allowed">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}
