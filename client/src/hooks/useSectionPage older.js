/**
 * hooks/useSectionPage.js  (Part 4 Prompt 10)
 *
 * Shared hook that encapsulates all state and logic common to
 * VerbalSectionPage, NonVerbalSectionPage, and AcademicSectionPage.
 *
 * Prompt 10 additions:
 *   - isDirty tracking: true after any field change, false after successful auto-save
 *   - autoSaveFailed flag: triggers the persistent failure banner on the page
 *   - retryAutoSave: lets the admin retry after a failed auto-save
 *   - These values are returned so pages can show the banner and register
 *     useBlocker / useBeforeUnload guards
 */

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

// ── Time helpers ──────────────────────────────────────────────

export function toSeconds({ hours, minutes, seconds }) {
  return (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
}

export function fromSeconds(totalSecs) {
  const s = Number(totalSecs) || 0;
  return {
    hours:   Math.floor(s / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// ── Hook ──────────────────────────────────────────────────────

export default function useSectionPage({
  type,
  testId,
  slug,
  navigate,
  createEmptyMcq,
  isMcqComplete,
  successToast,
  // Optional: override the API base path for Free Mock Test endpoints.
  // Defaults to the premium-test path `/admin/sections/${type}`.
  // Pass e.g. '/admin/free-mock-tests/sections/verbal' for Free Mock pages.
  apiBasePath,
}) {
  // Resolved base path used in all fetch/save/finalSave calls
  const basePath = apiBasePath ?? `/admin/sections/${type}`;
  // ── Time state ──────────────────────────────────────────
  const [time, setTime]           = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [timeError, setTimeError] = useState("");

  // ── MCQ count state ─────────────────────────────────────
  const [totalMCQs, setTotalMCQs]               = useState("");
  const [pendingCount, setPendingCount]         = useState(null);
  const [showReduceDialog, setShowReduceDialog] = useState(false);

  // ── MCQ list state ──────────────────────────────────────
  const [mcqs, setMcqs] = useState([]);

  // ── Page load state ─────────────────────────────────────
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── Auto-save state ─────────────────────────────────────
  const [saveStatus, setSaveStatus]           = useState("idle"); // idle|saving|saved|error
  const [isFinalSaving, setIsFinalSaving]     = useState(false);
  const [finalSaveError, setFinalSaveError]   = useState("");

  // ── Prompt 10: isDirty + auto-save failure banner ───────
  const [isDirty, setIsDirty]               = useState(false);
  const [autoSaveFailed, setAutoSaveFailed] = useState(false);

  const debounceRef = useRef(null);
  const isMounted   = useRef(true);
  const saveStatusRef = useRef("idle");
  // Hold latest values for the retry callback without re-creating it
  const latestPayload = useRef({ time, totalMCQs, mcqs });

  useEffect(() => {
    latestPayload.current = { time, totalMCQs, mcqs };
  }, [time, totalMCQs, mcqs]);

  // ── Derived ─────────────────────────────────────────────
  const totalSeconds = toSeconds(time);
  const mcqCountNum  = parseInt(totalMCQs, 10) || 0;
  const canSave =
    mcqs.length === mcqCountNum &&
    mcqCountNum > 0 &&
    totalSeconds >= 60 &&
    mcqs.every(isMcqComplete);

  // ── Unmount cleanup ─────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Fetch draft on mount ─────────────────────────────────
  useEffect(() => {
    async function fetchDraft() {
      setLoading(true);
      try {
        const { data } = await api.get(`${basePath}/${testId}`);
        if (!isMounted.current) return;

        if (data.section) {
          const { timeLimit, totalMCQs: savedCount, mcqs: savedMcqs } = data.section;
          setTime(fromSeconds(timeLimit));
          setTotalMCQs(String(savedCount));
          setMcqs((savedMcqs || []).map(createEmptyMcq));
        }
        // Loaded from server not dirty
        setIsDirty(false);
      } catch (err) {
        if (!isMounted.current) return;
        console.warn(`Could not load ${type} draft:`, err.message);
        setLoadError("Could not restore previous draft. Starting fresh.");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }

    if (testId) fetchDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, type]);

  // ── Core auto-save function ───────────────────────────────
  const performAutoSave = useCallback(
    async (overrideMcqs, overrideTime, overrideCount, force = false) => {
      const secs  = toSeconds(overrideTime  ?? latestPayload.current.time);
      const count = parseInt(overrideCount  ?? latestPayload.current.totalMCQs, 10);
      const list  = overrideMcqs            ?? latestPayload.current.mcqs;

      if (!testId) return;
      if (!force && (secs < 60 || !count || count < 1)) return;
      if (!isMounted.current) return;

      setSaveStatus("saving");
      saveStatusRef.current = "saving";
      try {
        await api.post(`${basePath}/draft`, {
          testId,
          timeLimit: secs,
          totalMCQs: count,
          mcqs:      list,
        });
        if (isMounted.current) {
          setSaveStatus("saved");
          setIsDirty(false);
          setAutoSaveFailed(false);
        }
        saveStatusRef.current = "saved";
      } catch (err) {
        console.error("Auto-save failed:", err.message);
        if (isMounted.current) {
          setSaveStatus("error");
          setAutoSaveFailed(true);
        }
        saveStatusRef.current = "error";
      }
    },
    [testId, type]
  );

  // ── Auto-save trigger (debounced) ─────────────────────────
  const triggerAutoSave = useCallback(
    (overrideMcqs, overrideTime, overrideCount) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => performAutoSave(overrideMcqs, overrideTime, overrideCount),
        800
      );
    },
    [performAutoSave]
  );

  // ── Retry auto-save (called from the failure banner) ─────
  const retryAutoSave = useCallback(() => {
    performAutoSave(undefined, undefined, undefined);
  }, [performAutoSave]);

  // ── Flush auto-save (called right before a final/section save) ──
  // Cancels any pending debounced auto-save and runs it immediately,
  // so the server-side draft (sectionRef) is guaranteed to exist
  // before the "save section" endpoint is called. Without this, a
  // user who edits an MCQ and immediately clicks Save can hit the
  // final-save endpoint before the 800ms debounced draft request has
  // even been sent, causing a "No draft found for this test" error.
  const flushAutoSave = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await performAutoSave(undefined, undefined, undefined, true);
    if (saveStatusRef.current === "error") {
      throw new Error("Could not save the section draft. Please check your inputs and try again.");
    }
  }, [performAutoSave]);

  // ── Field change handlers ────────────────────────────────

  function handleTimeChange(newTime) {
    setTime(newTime);
    const secs = toSeconds(newTime);
    setTimeError(secs < 60 ? "Total time must be at least 1 minute." : "");
    setSaveStatus("idle");
    setIsDirty(true);
    triggerAutoSave(undefined, newTime, undefined);
  }

  function handleCountChange(e) {
    const raw   = e.target.value;
    const value = parseInt(raw, 10);

    if (!raw) { setTotalMCQs(""); return; }

    if (value < mcqs.length) {
      setPendingCount(value);
      setShowReduceDialog(true);
      return;
    }

    setTotalMCQs(String(value));
    setSaveStatus("idle");
    setIsDirty(true);
    triggerAutoSave(undefined, undefined, String(value));
  }

  function handleReduceConfirm() {
    const newCount = pendingCount;
    const sliced   = mcqs.slice(0, newCount);
    setTotalMCQs(String(newCount));
    setMcqs(sliced);
    setShowReduceDialog(false);
    setPendingCount(null);
    setSaveStatus("idle");
    setIsDirty(true);
    triggerAutoSave(sliced, undefined, String(newCount));
  }

  function handleReduceCancel() {
    setShowReduceDialog(false);
    setPendingCount(null);
  }

  function handleMcqsChange(updated) {
    setMcqs(updated);
    setSaveStatus("idle");
    setIsDirty(true);
    triggerAutoSave(updated, undefined, undefined);
  }

  // ── Final save ───────────────────────────────────────────
  async function handleSaveSection() {
    setIsFinalSaving(true);
    setFinalSaveError("");
    try {
      await flushAutoSave();
      await api.post(`${basePath}/save/${testId}`);
      setIsDirty(false);
      toast.success(successToast);
      navigate(`/admin/dashboard/category/${slug}`);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        `Failed to save ${type} section. Please try again.`;
      setFinalSaveError(msg);
    } finally {
      setIsFinalSaving(false);
    }
  }

  return {
    // state
    loading, loadError,
    time, timeError, totalSeconds,
    totalMCQs, mcqCountNum,
    pendingCount, showReduceDialog,
    mcqs,
    saveStatus, isFinalSaving, finalSaveError,
    canSave,
    // Prompt 10
    isDirty,
    autoSaveFailed,
    retryAutoSave,
    flushAutoSave,
    // handlers
    handleTimeChange,
    handleCountChange,
    handleReduceConfirm,
    handleReduceCancel,
    handleMcqsChange,
    handleSaveSection,
    setSaveStatus,
  };
}
