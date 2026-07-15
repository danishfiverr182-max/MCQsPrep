/**
 * src/public/components/PublicErrorBoundary.jsx  (Prompt 70 Final QA)
 *
 * Class-based React Error Boundary that wraps individual public pages.
 * When a rendering error is caught it shows a friendly inline message
 * instead of a blank white screen.
 *
 * Usage:
 *   <PublicErrorBoundary>
 *     <HomePage />
 *   </PublicErrorBoundary>
 *
 * Why per-page, not global?
 *   Wrapping each page individually means one broken page (e.g. CategoryPage)
 *   doesn't blank the Navbar or Footer the shell stays usable.
 */

import { Component } from "react";
import { Link } from "react-router-dom";

export default class PublicErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError:     true,
      errorMessage: error?.message || "An unexpected error occurred.",
    };
  }

  componentDidCatch(error, info) {
    // Log to console in development; a real app would send to Sentry etc.
    if (import.meta.env.DEV) {
      console.error("[PublicErrorBoundary]", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        {/* Error card */}
        <div className="bg-white dark:bg-dark-surface border border-red-100 dark:border-red-900/40 rounded-2xl p-10 shadow-sm">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-5">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-txt-secondary mb-6">
            This section ran into an unexpected error. You can try reloading
            or go back to the homepage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition"
            >
              Try Again
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-txt-secondary text-sm font-semibold transition text-center"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
