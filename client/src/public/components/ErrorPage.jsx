/**
 * src/public/components/ErrorPage.jsx  (Prompt 80)
 *
 * Shared error card used as `errorElement` on every Part 8 route in App.jsx.
 * Renders when React Router catches a render-time exception inside a route.
 *
 * Props:
 *   message  optional override string; falls back to a generic message.
 *   backTo   optional override URL for the Back link (default: /free-mock-tests).
 *   backLabel optional label for the back link.
 *
 * Usage in router:
 *   { path: "/free-tests/:testId/hub", element: <TestHubPage />, errorElement: <ErrorPage /> }
 *
 * Can also be used as a standalone route element for "not found" states.
 */

import { useRouteError, Link, useParams } from "react-router-dom";

export default function ErrorPage({
  message,
  backTo,
  backLabel = "← Go Back",
}) {
  // useRouteError() returns the thrown error when used as errorElement
  const routeError = useRouteError();
  const { testId } = useParams() ?? {};

  // Compute a sensible back link:
  //  1. explicit backTo prop
  //  2. if we have a testId param, go to the hub
  //  3. fall back to the free tests listing
  const href =
    backTo ??
    (testId ? `/free-tests/${testId}/hub` : "/free-mock-tests");

  const label =
    testId && !backTo ? "← Back to Test Hub" : backLabel;

  // Show the route error message in development, generic message in production
  const isDev = import.meta.env.DEV;
  const displayMessage =
    message ??
    (isDev && routeError?.message
      ? routeError.message
      : "Something went wrong. Please go back and try again.");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface border border-red-200 dark:border-red-900/40 rounded-2xl p-10 shadow-sm text-center">
        {/* Icon */}
        <div className="text-5xl mb-4">⚠️</div>

        {/* Heading */}
        <h2 className="text-xl font-black text-gray-900 dark:text-txt-primary mb-3">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-txt-secondary mb-8 leading-relaxed">
          {displayMessage}
        </p>

        {/* Action */}
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition"
        >
          {label}
        </Link>

        {/* Dev-only raw error details */}
        {isDev && routeError && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 overflow-auto max-h-40">
              {routeError.stack ?? String(routeError)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
