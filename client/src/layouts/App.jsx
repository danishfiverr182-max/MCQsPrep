import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminErrorBoundary from "./components/admin/AdminErrorBoundary";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Premium access gate (Prompt 87)
import PremiumAccessGate    from "./public/components/PremiumAccessGate";
// Premium error boundary (Prompt 90)
import PremiumErrorBoundary from "./public/components/PremiumErrorBoundary";

// User pages
import HomePage          from "./pages/user/HomePage";
import CategoryPage      from "./pages/user/CategoryPage";
import FreeMockTestsPage from "./pages/user/FreeMockTestsPage";
import TestHubPage       from "./pages/user/TestHubPage";
import TakeTestPage      from "./pages/user/TakeTestPage";
import SectionResultPage from "./pages/user/SectionResultPage";
import McqReviewPage     from "./pages/user/McqReviewPage";
import NotFoundPage      from "./pages/user/NotFoundPage";

// Custom category (standalone) test flow — Prompt 12
import CustomTestHubPage    from "./pages/user/CustomTestHubPage";
import CustomTakeTestPage   from "./pages/user/CustomTakeTestPage";
import CustomTestResultPage from "./pages/user/CustomTestResultPage";

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
import VerbalSectionPage      from "./pages/admin/VerbalSectionPage";       // Prompt 03 full
import AddNonVerbalSectionPage from "./pages/admin/AddNonVerbalSectionPage"; // Prompt 04 stub
import AcademicSectionPage     from "./pages/admin/AcademicSectionPage";    // Prompt 06 full

// Test view page (Prompt 08)
import TestViewPage from "./pages/admin/TestViewPage";

// Part 5 (Prompt 01) Free Mock Tests admin page
import FreeMockTestsAdminPage from "./pages/admin/FreeMockTestsPage";

// Custom category (group → test → MCQs) admin editors
import AdminCustomTestPage          from "./pages/admin/AdminCustomTestPage";
import AdminFreeMockCustomTestPage  from "./pages/admin/AdminFreeMockCustomTestPage";

// Part 5 (Prompt 03) Free Mock Verbal section page
import FreeMockVerbalSectionPage from "./pages/admin/free-mock/FreeMockVerbalSectionPage";

// Part 5 (Prompt 05) Free Mock Non-Verbal section page
import FreeMockNonVerbalSectionPage from "./pages/admin/free-mock/FreeMockNonVerbalSectionPage";
import FreeMockAcademicSectionPage  from "./pages/admin/free-mock/FreeMockAcademicSectionPage";

// Part 5 (Prompt 08) Free Mock Test read-only view page
import FreeMockTestViewPage from "./pages/admin/free-mock/FreeMockTestViewPage";

// Part 5 (Prompt 02) Free Mock section stubs (built in Prompts 03–05)
const FreeMockSectionStub = ({ label }) => (
  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full mb-4">
        Coming Soon
      </span>
      <h2 className="text-2xl font-bold text-white mb-2">{label}</h2>
      <p className="text-gray-400 text-sm">
        This section page will be built in Part 5 Prompts 03–05.
      </p>
    </div>
  </div>
);

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin-x9k2";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AdminAuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontSize: "14px" },
              success: { duration: 3000 },
              error:   { duration: 4000 },
            }}
          />

          <Routes>
            {/* ── User Routes ───────────────────────────────── */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/free-mock-tests" element={<FreeMockTestsPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />

              {/* ── Result screen (Part 10 Prompt 2)   flat route, no guard ── */}
              {/* State passed via React Router; edge-case fallback fetches from DB */}
              <Route path="/result/section" element={<SectionResultPage />} />

              {/* ── Premium test routes: gated + error-bounded ─────────── */}
              <Route
                path="/test/:testId"
                element={
                  <PremiumErrorBoundary>
                    <PremiumAccessGate>
                      <TestHubPage />
                    </PremiumAccessGate>
                  </PremiumErrorBoundary>
                }
              />
              <Route
                path="/test/:testId/section/:sectionType"
                element={
                  <PremiumErrorBoundary>
                    <PremiumAccessGate>
                      <TakeTestPage />
                    </PremiumAccessGate>
                  </PremiumErrorBoundary>
                }
              />
              {/* Review page   still gated so direct-URL is blocked */}
              <Route
                path="/test/:testId/section/:sectionKey/review"
                element={
                  <PremiumErrorBoundary>
                    <PremiumAccessGate>
                      <McqReviewPage />
                    </PremiumAccessGate>
                  </PremiumErrorBoundary>
                }
              />

              {/* ── Custom category (standalone, single-section, 80% pass) routes — Prompt 12 ── */}
              <Route
                path="/test/custom/:testId"
                element={
                  <PremiumErrorBoundary>
                    <PremiumAccessGate>
                      <CustomTestHubPage />
                    </PremiumAccessGate>
                  </PremiumErrorBoundary>
                }
              />
              <Route
                path="/test/custom/:testId/take"
                element={
                  <PremiumErrorBoundary>
                    <PremiumAccessGate>
                      <CustomTakeTestPage />
                    </PremiumAccessGate>
                  </PremiumErrorBoundary>
                }
              />
              <Route
                path="/result/custom"
                element={
                  <PremiumErrorBoundary>
                    <PremiumAccessGate>
                      <CustomTestResultPage />
                    </PremiumAccessGate>
                  </PremiumErrorBoundary>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ── Legacy admin login ───────────────────────── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ── Part 2 Admin Auth secret path ─────────── */}
            <Route
              path={ADMIN_SECRET_PATH}
              element={
                <AdminErrorBoundary>
                  <AdminAuth />
                </AdminErrorBoundary>
              }
            />

            {/* ── Protected Admin Routes ───────────────────── */}
            <Route
              element={
                <AdminErrorBoundary>
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                </AdminErrorBoundary>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin" element={<AdminHomePage />} />

              {/* Part 5 Free Mock Tests management */}
              <Route path="/admin/free-mock-tests" element={<FreeMockTestsAdminPage />} />

              {/* Premium custom-test MCQ editor (Prompt 9C — was never routed) */}
              <Route path="/admin/custom-test/:testId" element={<AdminCustomTestPage />} />
              <Route path="/admin/custom-test/:testId/add-mcqs" element={<AdminCustomTestPage />} />

              {/* Free Mock Test MCQ editor for custom categories — Prompt 14 */}
              <Route path="/admin/free-mock-test/custom/:testId" element={<AdminFreeMockCustomTestPage />} />

              {/* Part 5 Free Mock section creation */}
              <Route
                path="/admin/free-mock-tests/:slug/test/:testId/add-verbal"
                element={<FreeMockVerbalSectionPage />}
              />
              <Route
                path="/admin/free-mock-tests/:slug/test/:testId/add-nonverbal"
                element={<FreeMockNonVerbalSectionPage />}
              />
              <Route
                path="/admin/free-mock-tests/:slug/test/:testId/add-academic"
                element={<FreeMockAcademicSectionPage />}
              />
              <Route
                path="/admin/free-mock-tests/:slug/test/:testId/view"
                element={<FreeMockTestViewPage />}
              />

              {/* Per-category test list page */}
              <Route path="/admin/dashboard/category/:slug" element={<AdminCategoryPage />} />

              {/* ── Section creation routes ───────────────────
                  Verbal: fully implemented (Prompt 03)
                  Non-Verbal: stub (Prompt 04)
                  Academic: stub (Prompt 05)
              ── */}
              <Route
                path="/admin/dashboard/category/:slug/test/:testId/add-verbal"
                element={<VerbalSectionPage />}
              />
              <Route
                path="/admin/dashboard/category/:slug/test/:testId/add-nonverbal"
                element={<AddNonVerbalSectionPage />}
              />
              <Route
                path="/admin/dashboard/category/:slug/test/:testId/add-academic"
                element={<AcademicSectionPage />}
              />

              {/* Read-only test detail view (Prompt 08) */}
              <Route
                path="/admin/dashboard/category/:slug/test/:testId/view"
                element={<TestViewPage />}
              />

              {/* Legacy create-test stub kept for compatibility */}
              <Route
                path="/admin/dashboard/category/:slug/create-test"
                element={
                  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10">
                      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full mb-4">Coming Soon</span>
                      <h2 className="text-2xl font-bold text-black mb-2">Create Test</h2>
                      <p className="text-gray-400 text-sm">This page will be implemented in Part 5. For now, the route is confirmed working.</p>
                    </div>
                  </div>
                }
              />
              <Route path="/admin/add-test/:category" element={<AdminAddTestPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
