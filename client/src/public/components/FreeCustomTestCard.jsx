/**
 * src/public/components/FreeCustomTestCard.jsx
 *
 * Card for a FREE custom-category test (single-section, group-based)
 * rendered on the Free Mock Tests listing page (/free-mock-tests).
 *
 * Unlike FreeTestCard (3-section default-category shape), this card
 * renders the single-section shape produced by
 * GET /api/free-mock-tests/custom/:categorySlug:
 *   { id, testNumber, displayName, timeLimitSeconds, totalMcqs, isFree }
 */

import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";

function formatTime(seconds) {
  if (!seconds) return null;
  const m = Math.round(seconds / 60);
  return `${m} minute${m !== 1 ? "s" : ""}`;
}

export default function FreeCustomTestCard({ test }) {
  const time = formatTime(test.timeLimitSeconds);

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-4 flex items-center justify-between gap-4">
      {/* Left: title + pills */}
      <div className="min-w-0">
        <p className="text-txt-primary dark:text-slate-100 font-semibold mb-1.5 truncate">{test.displayName}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="success">FREE</Badge>
          {test.totalMcqs ? <Badge variant="info">{test.totalMcqs} MCQs</Badge> : null}
          {time && <Badge variant="muted">{time}</Badge>}
        </div>
      </div>

      {/* Right: Start Test button */}
      <div className="shrink-0">
        <Link
          to={`/test/free-custom/${test.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-success dark:bg-green-600 hover:bg-success-dark dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          Start Test
        </Link>
      </div>
    </div>
  );
}
