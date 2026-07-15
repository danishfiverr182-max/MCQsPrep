import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminErrorBoundary from "./components/admin/AdminErrorBoundary";
import PublicErrorBoundary from "./public/components/PublicErrorBoundary";
import ErrorPage from "./public/components/ErrorPage";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import { PublicCategoriesProvider } from "./public/context/PublicCategoriesContext";

// User pages
import HomePage from "./pages/user/HomePage";
import CategoryPage from "./pages/user/CategoryPage";
import FreeMockTestsPage from "./pages/user/FreeMockTestsPage";
import TestHubPage from "./pages/user/TestHubPage";
import TakeTestPage from "./pages/user/TakeTestPage";
import PremiumSectionResultPage from "./pages/user/SectionResultPage";
import PremiumMcqReviewPage from "./pages/user/McqReviewPage";
import NotFoundPage from "./pages/user/NotFoundPage";

// Part 8 Free Mock Test Engine
import TestSectionPage from "./public/pages/TestSectionPage";
import SectionResultPage from "./public/pages/SectionResultPage";
import McqReviewPage from "./public/pages/McqReviewPage";
// TestHubPage for Part 8 routes (public folder version)
import FreeMockTestHubPage from "./public/pages/TestHubPage";

// Admin pages (Part 1)
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAddTestPage from "./pages/admin/AdminAddTestPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

// Admin auth page (Part 2)
import AdminAuth from "./pages/admin/AdminAuth";

// Admin homepage (Prompt 03)
import AdminHomePage from "./pages/admin/AdminHomePage";

// Per-category test list page (Prompt 06)
import AdminCategoryPage from "./pages/admin/CategoryPage";

// Section pages
import VerbalSectionPage      from "./pages/admin/VerbalSectionPage";
import NonVerbalSectionPage from "./pages/admin/NonVerbalSectionPage";
import AcademicSectionPage     from "./pages/admin/AcademicSectionPage";

// Test view page (Prompt 08)
import TestViewPage from "./pages/admin/TestViewPage";

// Part 5 Free Mock Tests admin pages
import FreeMockTestsAdminPage       from "./pages/admin/FreeMockTestsPage";
import FreeMockVerbalSectionPage    from "./pages/admin/free-mock/FreeMockVerbalSectionPage";
import FreeMockNonVerbalSectionPage from "./pages/admin/free-mock/FreeMockNonVerbalSectionPage";
import FreeMockAcademicSectionPage  from "./pages/admin/free-mock/FreeMockAcademicSectionPage";
import FreeMockTestViewPage         from "./pages/admin/free-mock/FreeMockTestViewPage";

// Custom category test creation (Prompt 2)
import AdminCustomTestPage from "./pages/admin/AdminCustomTestPage";
import AdminFreeCustomTestPage from "./pages/admin/AdminFreeCustomTestPage";

// Custom category user pages (Prompt 3)
import CustomTestHubPage    from "./pages/user/CustomTestHubPage";
import FreeCustomTestHubPage    from "./pages/user/FreeCustomTestHubPage";
import FreeCustomTakeTestPage   from "./pages/user/FreeCustomTakeTestPage";
import FreeCustomTestResultPage from "./pages/user/FreeCustomTestResultPage";
import CustomTakeTestPage   from "./pages/user/CustomTakeTestPage";
import CustomTestResultPage from "./pages/user/CustomTestResultPage";

import { useTheme } from "./context/ThemeContext";

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin-x9k2";

// ── Root wrapper providers that need to be inside the data router ──
function RootProviders() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontSize: "14px",
              background: isDark ? "#1E293B" : "#fff",
              color: isDark ? "#F1F5F9" : "#1E293B",
              border: "1px solid",
              borderColor: isDark ? "#334155" : "#CBD5E1",
            },
            success: { duration: 3000 },
            error:   { duration: 4000 },
          }}
        />
        <Outlet />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

// ── Coming-soon stub ─────────────────────────────────────────────────
const ComingSoon = ({ title, note }) => (
  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full mb-4">
        Coming Soon
      </span>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      {note && <p className="text-gray-400 text-sm">{note}</p>}
    </div>
  </div>
);

// ── Router definition ────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      // ── User routes ────────────────────────────────────────────────
      {
        element: (
          <PublicCategoriesProvider>
            <UserLayout />
          </PublicCategoriesProvider>
        ),
        children: [
          { path: "/",                                       element: <PublicErrorBoundary><HomePage /></PublicErrorBoundary> },
          { path: "/free-mock-tests",                        element: <PublicErrorBoundary><FreeMockTestsPage /></PublicErrorBoundary> },
          { path: "/category/:slug",                         element: <PublicErrorBoundary><CategoryPage /></PublicErrorBoundary> },
          // Custom category test routes (Prompt 3) — static segment "custom" must come before dynamic :testId
          { path: "/test/custom/:testId",      element: <PublicErrorBoundary><CustomTestHubPage /></PublicErrorBoundary> },
          { path: "/test/custom/:testId/take", element: <CustomTakeTestPage /> },
          { path: "/result/custom",            element: <PublicErrorBoundary><CustomTestResultPage /></PublicErrorBoundary> },
          { path: "/test/free-custom/:testId",      element: <PublicErrorBoundary><FreeCustomTestHubPage /></PublicErrorBoundary> },
          { path: "/test/free-custom/:testId/take", element: <FreeCustomTakeTestPage /> },
          { path: "/result/free-custom",            element: <PublicErrorBoundary><FreeCustomTestResultPage /></PublicErrorBoundary> },

          { path: "/test/:testId",                           element: <TestHubPage /> },
          { path: "/test/:testId/section/:sectionKey",      element: <TakeTestPage /> },
          // Flat result route — TakeTestPage navigates here on submit (result data is passed via location.state)
          { path: "/result/section",                          element: <PremiumSectionResultPage /> },
          { path: "/test/:testId/section/:sectionKey/result",  element: <PremiumSectionResultPage /> },
          { path: "/test/:testId/section/:sectionKey/review",  element: <PremiumMcqReviewPage /> },

          // ── Part 8 Free Mock Test Engine (Prompt 80: errorElement on every route) ──
          {
            path: "/free-tests/:testId/hub",
            element: <PublicErrorBoundary><FreeMockTestHubPage /></PublicErrorBoundary>,
            errorElement: <ErrorPage />,
          },
          {
            path: "/free-tests/:testId/section/:sectionKey",
            element: <TestSectionPage />,
            errorElement: <ErrorPage message="Something went wrong loading the test. Please go back and try again." />,
          },
          {
            path: "/free-tests/:testId/section/:sectionKey/result",
            element: <PublicErrorBoundary><SectionResultPage /></PublicErrorBoundary>,
            errorElement: <ErrorPage />,
          },
          {
            path: "/free-tests/:testId/section/:sectionKey/review",
            element: <PublicErrorBoundary><McqReviewPage /></PublicErrorBoundary>,
            errorElement: <ErrorPage />,
          },

          { path: "*",                                       element: <NotFoundPage /> },
        ],
      },

      // ── Legacy admin login ─────────────────────────────────────────
      { path: "/admin/login", element: <AdminLoginPage /> },

      // ── Part 2 Admin Auth secret path ───────────────────────────
      {
        path: ADMIN_SECRET_PATH,
        element: (
          <AdminErrorBoundary>
            <AdminAuth />
          </AdminErrorBoundary>
        ),
      },

      // ── Protected admin routes ─────────────────────────────────────
      {
        element: (
          <AdminErrorBoundary>
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          </AdminErrorBoundary>
        ),
        children: [
          { path: "/admin",           element: <AdminHomePage /> },
          { path: "/admin/dashboard", element: <AdminDashboardPage /> },
          { path: "/admin/add-test/:category", element: <AdminAddTestPage /> },
          { path: "/admin/users",     element: <AdminUsersPage /> },

          // Free Mock Tests
          { path: "/admin/free-mock-tests",                                              element: <FreeMockTestsAdminPage /> },
          { path: "/admin/free-mock-tests/:slug/test/:testId/add-verbal",               element: <AdminErrorBoundary><FreeMockVerbalSectionPage /></AdminErrorBoundary> },
          { path: "/admin/free-mock-tests/:slug/test/:testId/add-nonverbal",            element: <AdminErrorBoundary><FreeMockNonVerbalSectionPage /></AdminErrorBoundary> },
          { path: "/admin/free-mock-tests/:slug/test/:testId/add-academic",             element: <AdminErrorBoundary><FreeMockAcademicSectionPage /></AdminErrorBoundary> },
          { path: "/admin/free-mock-tests/:slug/test/:testId/view",                     element: <FreeMockTestViewPage /> },

          // Premium test management
          { path: "/admin/dashboard/category/:slug",                                    element: <AdminCategoryPage /> },
          { path: "/admin/dashboard/category/:slug/test/:testId/add-verbal",            element: <VerbalSectionPage /> },
          { path: "/admin/dashboard/category/:slug/test/:testId/add-nonverbal",         element: <NonVerbalSectionPage /> },
          { path: "/admin/dashboard/category/:slug/test/:testId/add-academic",          element: <AcademicSectionPage /> },
          { path: "/admin/dashboard/category/:slug/test/:testId/view",                  element: <TestViewPage /> },
          {
            path: "/admin/dashboard/category/:slug/create-test",
            element: <ComingSoon title="Create Test" note="This page will be implemented in Part 5." />,
          },

          // Custom category test page — canonical route (Prompt 9C)
          { path: "/admin/custom-test/:testId", element: <AdminErrorBoundary><AdminCustomTestPage /></AdminErrorBoundary> },
          { path: "/admin/free-mock-test/custom/:testId", element: <AdminErrorBoundary><AdminFreeCustomTestPage /></AdminErrorBoundary> },
          // Legacy /add-mcqs alias — keeps existing navigate() calls working
          { path: "/admin/custom-test/:testId/add-mcqs", element: <AdminErrorBoundary><AdminCustomTestPage /></AdminErrorBoundary> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}