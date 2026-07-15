/**
 * components/admin/CustomTestTable.jsx
 *
 * Renders standalone Test documents for a CUSTOM category (returned by
 * GET /admin/categories/:slug/tests when category.isDefault === false).
 *
 * Unlike TestTable (default categories: Army/Navy/Air Force), custom
 * category tests have no verbal/nonVerbal/academic split — each test is a
 * single section belonging to a TestGroup, tracked via `status` and
 * `mcqCount`/`totalMcqs` instead of per-section badges.
 *
 * Both "Edit" and "View" go to the same place: /admin/custom-test/:id — that
 * page is phase-driven off test.status and doubles as the editor whether the
 * test is in progress or already published.
 *
 * Props:
 *   tests       array of { _id, testNumber, groupName, status, isPublished,
 *                           mcqCount, totalMcqs, timeLimitSeconds, createdAt }
 *   loading     boolean, show skeleton rows when true
 *   slug        category slug (unused for navigation here, kept for parity)
 *   page        current page number (1-based)
 *   totalPages  total number of pages
 *   onPrevPage  () => void
 *   onNextPage  () => void
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ConfirmDialog from "./ConfirmDialog";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

const STATUS_META = {
  published: { label: "Published", cls: "text-success bg-success-light/10 border-success/20" },
  mcqs_pending: { label: "MCQs Pending", cls: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  settings_pending: { label: "Settings Pending", cls: "text-accent bg-accent/10 border-accent/20" },
  in_progress: { label: "In Progress", cls: "text-accent bg-accent/10 border-accent/20" },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.in_progress;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

function ViewIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightSmallIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ActionButtons({ test, onDeleteSuccess }) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpen = () => navigate(`/admin/custom-test/${test._id}/add-mcqs`);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/tests/${test._id}`);
      setDialogOpen(false);
      toast.success(`Test ${test.testNumber} deleted successfully`);
      onDeleteSuccess(test);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete test. Please try again.";
      toast.error(msg);
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary bg-bg/50 hover:bg-bg border border-border/50 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <ViewIcon />
          {test.status === "published" ? "View" : "Continue"}
        </button>
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark bg-blue-400/5 hover:bg-blue-400/10 border border-blue-400/10 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <EditIcon />
          Edit
        </button>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:text-red-300 bg-danger-light/10 hover:bg-danger-light/20 border border-danger/20 px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          <DeleteIcon />
          Delete
        </button>
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={`Delete ${test.groupName} Test ${test.testNumber}?`}
        message="This will permanently delete all MCQs in this test. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDialogOpen(false)}
      />
    </>
  );
}

function SkeletonRows() {
  return (
    <>
      <div className="hidden md:block overflow-x-auto bg-surface/60 border border-border rounded-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/60 text-xs font-semibold text-txt-secondary uppercase tracking-widest">
              <th className="px-6 text-txt-secondary py-3">Test</th>
              <th className="px-6 text-txt-secondary py-3">Group</th>
              <th className="px-6 text-txt-secondary py-3">MCQs</th>
              <th className="px-6 text-txt-secondary py-3">Status</th>
              <th className="px-6 text-txt-secondary py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {[1, 2, 3].map((n) => (
              <tr key={n} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 w-24 bg-bg rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-bg rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-bg rounded" /></td>
                <td className="px-6 py-4"><div className="h-5 w-24 bg-bg rounded-full" /></td>
                <td className="px-6 py-4"><div className="h-7 w-40 bg-bg rounded-lg ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-surface/60 border border-border rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-bg rounded" />
            <div className="h-3 w-20 bg-bg rounded" />
            <div className="h-7 w-full bg-bg rounded-lg" />
          </div>
        ))}
      </div>
    </>
  );
}

function PaginationControls({ page, totalPages, onPrevPage, onNextPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <button
        onClick={onPrevPage}
        disabled={page <= 1}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-txt-secondary hover:text-txt-primary disabled:opacity-30 disabled:cursor-not-allowed bg-bg/50 hover:bg-bg border border-border/50 px-3 py-2 rounded-lg transition-colors duration-150"
      >
        <ChevronLeftIcon />
        Previous
      </button>
      <span className="text-xs text-txt-muted">
        Page <span className="text-txt-secondary font-medium">{page}</span> of{" "}
        <span className="text-txt-secondary font-medium">{totalPages}</span>
      </span>
      <button
        onClick={onNextPage}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-txt-secondary hover:text-txt-primary disabled:opacity-30 disabled:cursor-not-allowed bg-bg/50 hover:bg-bg border border-border/50 px-3 py-2 rounded-lg transition-colors duration-150"
      >
        Next
        <ChevronRightSmallIcon />
      </button>
    </div>
  );
}

export default function CustomTestTable({
  tests: initialTests = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPrevPage = () => {},
  onNextPage = () => {},
}) {
  const [tests, setTests] = useState(initialTests);

  const prevInitialRef = useState(() => initialTests)[0];
  if (prevInitialRef !== initialTests) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState(() => setTests(initialTests));
  }

  // Removes the deleted test locally and shifts the testNumber of every
  // other test in the same group that came after it down by 1, mirroring
  // the renumbering the server now does on delete. This keeps the numbers
  // shown in this table correct without a full re-fetch.
  const handleDeleteSuccess = (deletedTest) => {
    setTests((prev) =>
      prev
        .filter((t) => t._id !== deletedTest._id)
        .map((t) =>
          t.groupId === deletedTest.groupId && t.testNumber > deletedTest.testNumber
            ? { ...t, testNumber: t.testNumber - 1 }
            : t
        )
    );
  };

  if (loading) return <SkeletonRows />;
  if (tests.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* ── Desktop table ─────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto bg-surface/60 border border-border rounded-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/60 text-xs font-semibold text-txt-secondary uppercase tracking-widest">
              <th className="px-6 text-txt-secondary py-3">Test</th>
              <th className="px-6 text-txt-secondary py-3">Group</th>
              <th className="px-6 text-txt-secondary py-3">MCQs</th>
              <th className="px-6 text-txt-secondary py-3">Time Limit</th>
              <th className="px-6 text-txt-secondary py-3">Status</th>
              <th className="px-6 text-txt-secondary py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {tests.map((test) => (
              <tr key={test._id} className="hover:bg-surface/40 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-txt-primary whitespace-nowrap">
                  {test.groupName} Test {test.testNumber}
                </td>
                <td className="px-6 py-4 text-sm text-txt-secondary whitespace-nowrap">
                  {test.groupName}
                </td>
                <td className="px-6 py-4 text-sm text-txt-secondary whitespace-nowrap">
                  {test.mcqCount ?? 0}
                  {test.totalMcqs ? ` / ${test.totalMcqs}` : ""}
                </td>
                <td className="px-6 py-4 text-sm text-txt-secondary whitespace-nowrap">
                  {formatTime(test.timeLimitSeconds)}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={test.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <ActionButtons test={test} onDeleteSuccess={handleDeleteSuccess} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ──────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {tests.map((test) => (
          <div key={test._id} className="bg-surface/60 border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-txt-primary text-sm font-semibold leading-tight">
                {test.groupName} Test {test.testNumber}
              </p>
              <StatusPill status={test.status} />
            </div>
            <p className="text-txt-secondary text-xs">
              {test.mcqCount ?? 0}
              {test.totalMcqs ? ` / ${test.totalMcqs}` : ""} MCQs · {formatTime(test.timeLimitSeconds)} ·{" "}
              {formatDate(test.createdAt)}
            </p>
            <ActionButtons test={test} onDeleteSuccess={handleDeleteSuccess} />
          </div>
        ))}
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      <PaginationControls page={page} totalPages={totalPages} onPrevPage={onPrevPage} onNextPage={onNextPage} />
    </div>
  );
}
