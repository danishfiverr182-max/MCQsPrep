import { Component } from "react";

/**
 * AdminErrorBoundary
 *
 * Wraps the entire admin section (AdminLayout + all admin pages).
 * Catches any unexpected JavaScript render error so the user sees a
 * friendly fallback instead of a blank white screen.
 *
 * Usage in App.jsx:
 *   <AdminErrorBoundary>
 *     <AdminLayout />
 *   </AdminErrorBoundary>
 */
export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; wire up to Sentry/Datadog in production.
    console.error("[AdminErrorBoundary] Uncaught render error:", error, info.componentStack);
  }

  handleRefresh = () => {
    // Clear the error state first, then reload so we get a clean component tree
    this.setState({ hasError: false, error: null }, () => {
      window.location.reload();
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
          {/* Error icon */}
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h2 className="text-base font-bold text-txt-primary mb-1">
            Something went wrong
          </h2>
          <p className="text-sm text-txt-muted mb-6">
            An unexpected error occurred in the admin panel. Please refresh the
            page your session is still active.
          </p>

          {/* Show error message in development only */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-bg text-txt-muted rounded-lg p-3 mb-5 overflow-auto max-h-32 whitespace-pre-wrap break-all">
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={this.handleRefresh}
            className="w-full bg-blue-900 hover:bg-blue-800 text-txt-primary font-semibold text-sm py-2.5 rounded-lg transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
