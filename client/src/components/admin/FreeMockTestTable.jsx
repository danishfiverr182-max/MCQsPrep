/**
 * components/admin/FreeMockTestTable.jsx  (Part 5 Prompt 07)
 *
 * Renders a table of FreeMockTest documents for a single category.
 * Mirrors the column structure of TestTable.jsx from Part 4.
 *
 * Columns: Test Number | Created | Verbal | Non-Verbal | Academic | Status | Actions
 *
 * Props:
 *   tests      array from GET /api/admin/free-mock-tests/categories/:slug/tests
 *   loading    boolean, show 3 skeleton rows when true
 *   slug       category slug (used to build action routes)
 *   page       current page number (1-based)
 *   totalPages total pages
 *   onPrevPage () => void
 *   onNextPage () => void
 *
 * Actions:
 *   View   navigates to /admin/free-mock-tests/:slug/test/:testId/view (Prompt 08)
 *   Edit   disabled stub, tooltip "Coming soon"
 *   Delete opens ConfirmDialog; on confirm calls
 *            DELETE /api/admin/free-mock-tests/:testId with optimistic
 *            row removal (restored on failure)  ← Prompt 09
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import SectionStatusBadge from "./SectionStatusBadge";
import ConfirmDialog from "./ConfirmDialog";

// ── Helpers ───────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return " ";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return " ";
  }
}

// ── Sub-components ────────────────────────────────────────────

function StatusPill({ isPublished }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
        isPublished
          ? "text-success bg-success-light/10 border-success/20"
          : "text-txt-secondary bg-txt-muted/10 border-txt-muted/20"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-success-light" : "bg-txt-muted"}`} />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function ViewIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

// ── Skeleton ──────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i} className="border-b border-border/50 animate-pulse">
          <td className="px-4 py-3"><div className="h-4 w-10 bg-bg rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-bg rounded" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 bg-bg rounded-full" /></td>
          <td className="px-4 py-3"><div className="h-5 w-24 bg-bg rounded-full" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 bg-bg rounded-full" /></td>
          <td className="px-4 py-3"><div className="h-5 w-16 bg-bg rounded-full" /></td>
          <td className="px-4 py-3"><div className="h-7 w-28 bg-bg rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

// ── Mobile card ───────────────────────────────────────────────

function MobileCard({ test, slug, onDelete, deletingId }) {
  const navigate = useNavigate();
  const isDeleting = deletingId === test._id;

  return (
    <div className="bg-surface/60 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-txt-primary">
          Test #{test.testNumber}
        </span>
        <StatusPill isPublished={test.isPublished} />
      </div>
      <p className="text-xs text-txt-muted">{formatDate(test.createdAt)}</p>

      <div className="flex flex-wrap gap-1.5">
        <SectionStatusBadge label="Verbal"     status={test.sections.verbal.status} />
        <SectionStatusBadge label="Non-Verbal" status={test.sections.nonVerbal.status} />
        <SectionStatusBadge label="Academic"   status={test.sections.academic.status} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => navigate(`/admin/free-mock-tests/${slug}/test/${test._id}/view`)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-blue-300
            border border-blue-400/20 hover:border-blue-400/40 px-2.5 py-1.5 rounded-lg transition"
        >
          <ViewIcon /> View
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex items-center gap-1.5 text-xs font-medium text-txt-muted
            border border-border px-2.5 py-1.5 rounded-lg cursor-not-allowed opacity-50"
        >
          <EditIcon /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(test)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 text-xs font-medium text-danger hover:text-red-300
            border border-danger/20 hover:border-danger/40 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DeleteIcon /> {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Pagination controls ───────────────────────────────────────

function Pagination({ page, totalPages, onPrevPage, onNextPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      <button
        type="button"
        onClick={onPrevPage}
        disabled={page <= 1}
        className="flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary
          disabled:opacity-30 disabled:cursor-not-allowed transition px-3 py-1.5 rounded-lg
          border border-border hover:border-border disabled:hover:border-border"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      <span className="text-xs text-txt-muted">
        Page <span className="text-txt-secondary font-medium">{page}</span> of{" "}
        <span className="text-txt-secondary font-medium">{totalPages}</span>
      </span>
      <button
        type="button"
        onClick={onNextPage}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary
          disabled:opacity-30 disabled:cursor-not-allowed transition px-3 py-1.5 rounded-lg
          border border-border hover:border-border disabled:hover:border-border"
      >
        Next
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function FreeMockTestTable({
  tests,
  loading,
  slug,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}) {
  const navigate = useNavigate();

  // Local copy of tests so we can optimistically remove a row on delete
  // and restore it if the DELETE call fails. Synced whenever the parent
  // passes a new tests array (e.g. on page change or initial load).
  const [localTests, setLocalTests] = useState(tests);
  useEffect(() => { setLocalTests(tests); }, [tests]);

  // Dialog + in-flight delete state
  const [confirmTarget, setConfirmTarget] = useState(null); // the test pending deletion
  const [deletingId, setDeletingId]       = useState(null);

  function handleDelete(test) {
    setConfirmTarget(test);
  }

  function handleCancelDelete() {
    if (deletingId) return; // don't allow closing mid-request
    setConfirmTarget(null);
  }

  async function handleConfirmDelete() {
    const test = confirmTarget;
    if (!test) return;

    setDeletingId(test._id);

    // Optimistic removal + renumbering — mirrors the contiguous
    // renumbering the server now performs on delete, so the table stays
    // correct immediately instead of only after a refresh.
    const previousTests = localTests;
    setLocalTests((prev) =>
      prev
        .filter((t) => t._id !== test._id)
        .map((t) =>
          t.testNumber > test.testNumber
            ? { ...t, testNumber: t.testNumber - 1 }
            : t
        )
    );

    try {
      const res = await api.delete(`/admin/free-mock-tests/${test._id}`);
      setConfirmTarget(null);

      if (res.data?.imagesFailed > 0) {
        toast(
          `Test deleted (some images may need manual cleanup in Cloudinary)`,
          { icon: "⚠️", style: { background: "#78350f", color: "#fde68a" } }
        );
      } else {
        toast.success(`Free Mock Test ${test.testNumber} deleted successfully`);
      }
    } catch (err) {
      // Restore the row deletion failed
      setLocalTests(previousTests);
      const msg = err.response?.data?.message || "Failed to delete test. Please try again.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  if (!loading && localTests.length === 0) {
    return (
      <p className="text-center py-8 text-sm text-txt-muted">
        No free mock tests found for this category yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Desktop table ─────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                Verbal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                Non-Verbal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                Academic
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface/40">
            {loading ? (
              <SkeletonRows />
            ) : (
              localTests.map((test) => (
                <tr
                  key={test._id}
                  className="border-b border-border/50 hover:bg-bg/30 transition-colors"
                >
                  {/* Test number */}
                  <td className="px-4 py-3 text-txt-secondary font-semibold text-xs">
                    #{test.testNumber}
                  </td>

                  {/* Created date */}
                  <td className="px-4 py-3 text-txt-secondary text-xs whitespace-nowrap">
                    {formatDate(test.createdAt)}
                  </td>

                  {/* Section badges */}
                  <td className="px-4 py-3">
                    <SectionStatusBadge label="Verbal" status={test.sections.verbal.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SectionStatusBadge label="Non-Verbal" status={test.sections.nonVerbal.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SectionStatusBadge label="Academic" status={test.sections.academic.status} />
                  </td>

                  {/* Published / Draft pill */}
                  <td className="px-4 py-3">
                    <StatusPill isPublished={test.isPublished} />
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* View */}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/free-mock-tests/${slug}/test/${test._id}/view`)
                        }
                        title="View test"
                        className="flex items-center gap-1 text-xs font-medium text-brand
                          hover:text-blue-300 border border-blue-400/20 hover:border-blue-400/40
                          px-2 py-1.5 rounded-lg transition"
                      >
                        <ViewIcon /> View
                      </button>

                      {/* Edit disabled stub */}
                      <button
                        type="button"
                        disabled
                        title="Coming soon"
                        className="flex items-center gap-1 text-xs font-medium text-txt-muted
                          border border-border px-2 py-1.5 rounded-lg cursor-not-allowed opacity-50"
                      >
                        <EditIcon /> Edit
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(test)}
                        disabled={deletingId === test._id}
                        title="Delete test"
                        className="flex items-center gap-1 text-xs font-medium text-danger
                          hover:text-red-300 border border-danger/20 hover:border-danger/40
                          px-2 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <DeleteIcon /> {deletingId === test._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ──────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-bg rounded" />
                  <div className="h-5 w-20 bg-bg rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-bg rounded-full" />
                  <div className="h-5 w-24 bg-bg rounded-full" />
                  <div className="h-5 w-20 bg-bg rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-16 bg-bg rounded-lg" />
                  <div className="h-7 w-14 bg-bg rounded-lg" />
                  <div className="h-7 w-16 bg-bg rounded-lg" />
                </div>
              </div>
            ))
          : localTests.map((test) => (
              <MobileCard
                key={test._id}
                test={test}
                slug={slug}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
      </div>

      {/* ── Pagination ─────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />

      {/* ── Delete confirmation dialog ───────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={`Delete Free Mock Test ${confirmTarget?.testNumber ?? ""}?`}
        message="This will permanently delete all MCQs and images in this test. Visitors will no longer be able to take it. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous={true}
        loading={!!deletingId}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
