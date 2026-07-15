/**
 * AddNonVerbalSectionPage  (Part 4 Prompt 02 stub)
 *
 * Placeholder for the Non-Verbal Section creation form.
 * Will be fully implemented in Prompt 04.
 */

import { Link, useParams } from "react-router-dom";

export default function AddNonVerbalSectionPage() {
  const { slug, testId } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-surface border border-border rounded-2xl p-10">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-4">
          Coming Soon Prompt 04
        </span>
        <h2 className="text-2xl font-bold text-txt-primary mb-2">Add Non-Verbal Section</h2>
        <p className="text-txt-secondary text-sm mb-1">
          Test ID: <code className="text-amber-600 bg-bg px-1.5 py-0.5 rounded text-xs">{testId}</code>
        </p>
        <p className="text-txt-secondary text-sm mb-6">
          The non-verbal section creation form will be implemented in Prompt 04.
          The route is confirmed working.
        </p>
        <Link
          to={`/admin/dashboard/category/${slug}`}
          className="inline-flex items-center gap-2 border border-border text-txt-secondary hover:text-txt-primary hover:border-txt-muted text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-150"
        >
          ← Back to Category
        </Link>
      </div>
    </div>
  );
}
