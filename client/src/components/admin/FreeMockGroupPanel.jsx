/**
 * components/admin/FreeMockGroupPanel.jsx
 *
 * Slide-down panel for FREE MOCK TEST management on custom categories.
 * Nearly identical to TestGroupPanel.jsx (the premium test group panel),
 * but creates/manages free mock tests instead of premium ones.
 *
 * State A — No group selected:
 *   - Group Name input → Create Group → POST /api/test-groups
 *     (groups are shared between premium and free tests within a category)
 *   - Or select an existing group, loaded via GET /api/test-groups/:categorySlug
 *
 * State B — Group selected:
 *   - Lists free tests in the group (GET /api/free-mock-tests/custom/group/:groupId/tests)
 *   - "+ Add Free Test" → POST /api/free-mock-tests/custom/create { groupId }
 *     → navigates to /admin/free-mock-test/custom/:testId
 *
 * Props:
 *   category   { _id, name, slug }
 *   onClose    () => void
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ConfirmDialog from "./ConfirmDialog";

// ── Icons ─────────────────────────────────────────────────────

function Spinner({ size = "sm" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <span
      className={`${cls} border-2 border-current border-t-transparent rounded-full animate-spin inline-block`}
    />
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

// ── Status helpers (free tests only have in_progress | published) ──

function getStatusMeta(status) {
  if (status === "published") {
    return { icon: <CheckCircleIcon />, label: "Published", badgeCls: "bg-success-light/10 text-success" };
  }
  // in_progress, or mcqs not fully added yet
  return { icon: status === "settings_pending" ? <ClockIcon /> : <GearIcon />, label: status === "settings_pending" ? "Settings Pending" : "In Progress", badgeCls: "bg-accent/10 text-accent" };
}

// ── Test row (State B) ────────────────────────────────────────

function FreeTestRow({ groupName, test, onAction, onDeleted }) {
  const isPublished = test.status === "published";
  const { icon, label, badgeCls } = getStatusMeta(test.status);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await api.delete(`/free-mock-tests/custom/${test._id}`);
      setDialogOpen(false);
      toast.success(`Free Test ${test.testNumber} deleted successfully`);
      onDeleted(test);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete free test.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm text-txt-secondary truncate">
            {groupName} Free Test {test.testNumber}
          </span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${badgeCls}`}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          <button
            onClick={() => onAction(test._id)}
            className={`text-xs font-semibold transition ${
              isPublished ? "text-success hover:text-green-300" : "text-accent hover:text-amber-600"
            }`}
          >
            {isPublished ? "View →" : "Continue →"}
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            title="Delete this test"
            className="text-danger hover:text-red-300 transition"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={`Delete ${groupName} Free Test ${test.testNumber}?`}
        message="This will permanently delete this free test and all its MCQs. This cannot be undone."
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

// ── Group chip (State A) ──────────────────────────────────────

function GroupChip({ group, onClick }) {
  return (
    <button
      onClick={() => onClick(group)}
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-accent/30 text-accent bg-accent/10 hover:bg-accent/20 hover:border-accent/50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30"
    >
      {group.name}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────

export default function FreeMockGroupPanel({ category, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // ── State A: group creation ───────────────────────────────
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [existingGroups, setExistingGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // ── State B: group selected ───────────────────────────────
  const [activeGroup, setActiveGroup] = useState(null);
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [addingTest, setAddingTest] = useState(false);
  const [addTestError, setAddTestError] = useState("");

  useEffect(() => {
    if (!activeGroup) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeGroup]);

  // Groups are shared with premium tests   same endpoint
  useEffect(() => {
    async function fetchGroups() {
      try {
        const { data } = await api.get(`/test-groups/${category.slug}`);
        setExistingGroups(data);
      } catch {
        // non-fatal
      } finally {
        setLoadingGroups(false);
      }
    }
    fetchGroups();
  }, [category.slug]);

  // Reload free tests whenever active group changes
  useEffect(() => {
    if (!activeGroup) return;
    setLoadingTests(true);
    setAddTestError("");
    api
      .get(`/free-mock-tests/custom/group/${activeGroup._id}/tests`)
      .then(({ data }) => setTests(data))
      .catch(() => setTests([]))
      .finally(() => setLoadingTests(false));
  }, [activeGroup]);

  // ── Create group — POST /api/test-groups ──────────────────
  async function handleCreateGroup() {
    setCreateError("");
    if (!groupName.trim()) {
      setCreateError("Group name is required.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post("/test-groups", {
        name: groupName.trim(),
        categoryId: category._id,
      });
      setExistingGroups((prev) => [...prev, data]);
      setGroupName("");
      setActiveGroup(data);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setCreating(false);
    }
  }

  // ── Add new free test — POST /api/free-mock-tests/custom/create ──
  async function handleAddFreeTest() {
    if (!activeGroup) return;
    setAddingTest(true);
    setAddTestError("");
    try {
      const { data } = await api.post("/free-mock-tests/custom/create", {
        groupId: activeGroup._id,
      });
      navigate(`/admin/free-mock-test/custom/${data._id}`);
    } catch (err) {
      setAddTestError(err.response?.data?.message || "Failed to create free test.");
    } finally {
      setAddingTest(false);
    }
  }

  function handleTestAction(testId) {
    navigate(`/admin/free-mock-test/custom/${testId}`);
  }

  function handleChipClick(group) {
    setActiveGroup(group);
    setCreateError("");
  }

  // ═════════════════════════════════════════════════════════════
  // STATE A — No group selected
  // ═════════════════════════════════════════════════════════════
  if (!activeGroup) {
    return (
      <div className="mt-3 bg-surface border border-border rounded-xl p-5 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-txt-primary">
            Add a Free Test Group to{" "}
            <span className="text-accent">{category.name}</span>
          </h4>
          <button
            onClick={onClose}
            className="text-txt-muted hover:text-txt-secondary transition text-lg leading-none ml-3 shrink-0"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-txt-secondary block mb-1">
              Group Name <span className="text-danger">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              placeholder="e.g. Police, Teaching, Forest Department"
              className="w-full bg-surface border border-border text-txt-primary text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>

          {createError && (
            <p className="text-xs text-danger bg-danger-light/10 border border-danger/20 rounded-lg px-3 py-2">
              {createError}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateGroup}
              disabled={creating}
              className="bg-accent hover:bg-accent-dark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {creating && <Spinner />}
              {creating ? "Creating…" : "Create Group"}
            </button>
          </div>

          {loadingGroups ? (
            <div className="flex gap-2 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 bg-bg rounded-full animate-pulse" />
              ))}
            </div>
          ) : existingGroups.length > 0 ? (
            <div className="border-t border-border pt-3 mt-1">
              <p className="text-xs text-txt-muted mb-2.5">Or select existing group</p>
              <div className="flex flex-wrap gap-2">
                {existingGroups.map((g) => (
                  <GroupChip key={g._id} group={g} onClick={handleChipClick} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // STATE B — Group selected
  // ═════════════════════════════════════════════════════════════
  return (
    <div className="mt-3 bg-surface border border-border rounded-xl p-5 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-txt-primary">
            {activeGroup.name} Free Tests
          </h4>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2 py-0.5 rounded-full">
            Free Mock Test
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-txt-muted hover:text-txt-secondary transition text-lg leading-none ml-3 shrink-0"
        >
          ×
        </button>
      </div>

      {loadingTests ? (
        <div className="space-y-2 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 bg-bg rounded animate-pulse" />
          ))}
        </div>
      ) : tests.length > 0 ? (
        <div className="mb-4">
          {tests.map((test) => (
            <FreeTestRow
              key={test._id}
              groupName={activeGroup.name}
              test={test}
              onAction={handleTestAction}
              onDeleted={(deletedTest) =>
                setTests((prev) =>
                  prev
                    .filter((t) => t._id !== deletedTest._id)
                    .map((t) =>
                      t.testNumber > deletedTest.testNumber
                        ? { ...t, testNumber: t.testNumber - 1 }
                        : t
                    )
                )
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-txt-muted mb-4">
          No free tests yet. Click below to add the first one.
        </p>
      )}

      <button
        onClick={handleAddFreeTest}
        disabled={addingTest}
        className="flex items-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
      >
        {addingTest ? <Spinner /> : <span className="text-base leading-none">+</span>}
        {addingTest ? "Creating…" : "Add Free Test"}
      </button>

      {addTestError && (
        <p className="mt-2 text-xs text-danger bg-danger-light/10 border border-danger/20 rounded-lg px-3 py-2">
          {addTestError}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-border">
        <button
          onClick={() => setActiveGroup(null)}
          className="text-xs text-txt-muted hover:text-txt-secondary transition"
        >
          ← Back to Groups
        </button>
      </div>
    </div>
  );
}
