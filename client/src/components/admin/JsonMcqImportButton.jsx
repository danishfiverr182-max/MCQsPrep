/**
 * components/admin/JsonMcqImportButton.jsx
 *
 * Drop-in "Import MCQs from JSON" button used on every MCQ-adding screen:
 *   - Verbal / Non-Verbal / Academic section pages (premium + free mock)
 *   - Custom category test pages (premium + free mock)
 *
 * Reads the selected .json file, validates + normalizes it (see
 * utils/mcqJsonImport.js), and calls onImport(mcqs) with the fully-formed
 * array   the count of MCQs created always matches the file, regardless
 * of whatever count is currently set on the page.
 *
 * Props:
 *   mode                {"container"|"customTest"}  which shape to normalize into
 *   allowEmptyQuestion  {boolean}   pass true for Non-Verbal (image-based) sections
 *   onImport            {function}  async (mcqs) => void   receives the normalized array
 *   disabled            {boolean}
 */

import { useRef, useState } from "react";
import {
  parseMcqJsonText,
  normalizeForContainerMcqs,
  normalizeForCustomTestMcqs,
  distributionWarning,
  readFileAsText,
} from "../../utils/mcqJsonImport";

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function JsonMcqImportButton({
  mode = "container",
  allowEmptyQuestion = false,
  onImport,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same filename later
    if (!file) return;

    setError("");
    setNotice("");
    setSuccess("");
    setBusy(true);

    try {
      const text = await readFileAsText(file);
      const rawList = parseMcqJsonText(text);

      const { mcqs, distribution } =
        mode === "customTest"
          ? normalizeForCustomTestMcqs(rawList)
          : normalizeForContainerMcqs(rawList, { allowEmptyQuestion });

      await onImport(mcqs);

      const warn = distributionWarning(distribution, mcqs.length);
      if (warn) setNotice(warn);
      setSuccess(`Imported ${mcqs.length} MCQ${mcqs.length !== 1 ? "s" : ""} from JSON.`);
    } catch (err) {
      setError(err.message || "Could not import that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          {busy ? <Spinner /> : <UploadIcon />}
          {busy ? "Importing…" : "Import MCQs from JSON"}
        </button>
        <span className="text-xs text-txt-muted">
          Creates containers and fills them in automatically   the count always matches the file.
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-danger bg-danger-light/10 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-xs text-amber-500 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}
      {success && !error && (
        <p className="text-xs text-success bg-success-light/10 border border-success/20 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
    </div>
  );
}
