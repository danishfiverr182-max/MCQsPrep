/**
 * components/admin/ImageInput.jsx  (Part 4 Prompt 05)
 *
 * Two-tab image input for Non-Verbal MCQ containers.
 *
 * Tabs:
 *   'Upload File' <input type="file"> → reads as base64 → POST /api/admin/upload-image
 *                   Shows upload progress and a warning for files > 500 KB.
 *   'Paste URL'   text input → on blur/Enter, sets imageUrl directly (no upload call).
 *
 * After a successful upload or URL paste, a thumbnail preview (max 80px tall) is shown
 * alongside a 'Remove Image' button.
 *
 * Props:
 *   imageUrl      {string}   current image URL ('' = no image)
 *   imagePublicId {string}   Cloudinary public_id ('' if pasted URL)
 *   onChange      {function} called with { imageUrl, imagePublicId } on change
 */

import { useState, useRef } from "react";
import api from "../../api/axios";

const MAX_RECOMMENDED_BYTES = 500 * 1024; // 500 KB

// ── Icons ─────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────

export default function ImageInput({ imageUrl = "", imagePublicId = "", onChange }) {
  const [tab, setTab]               = useState("upload"); // 'upload' | 'url'
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [sizeWarning, setSizeWarning] = useState("");
  const [pasteValue, setPasteValue] = useState("");
  const fileInputRef                = useRef(null);

  const hasImage = imageUrl && imageUrl.trim().length > 0;

  // ── File upload handler ───────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setSizeWarning("");

    // Size warning (non-blocking)
    if (file.size > MAX_RECOMMENDED_BYTES) {
      setSizeWarning("Image is large consider compressing it (recommended max 500 KB).");
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post("/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onChange({ imageUrl: data.url, imagePublicId: data.publicId });
    } catch (err) {
      const msg = err?.response?.data?.message || "Upload failed. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── URL paste handler ─────────────────────────────────────
  function commitUrl() {
    const trimmed = pasteValue.trim();
    if (!trimmed) return;
    onChange({ imageUrl: trimmed, imagePublicId: "" });
    setSizeWarning("");
    setUploadError("");
  }

  function handleUrlKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); commitUrl(); }
  }

  // ── Remove image ──────────────────────────────────────────
  function handleRemove() {
    onChange({ imageUrl: "", imagePublicId: "" });
    setPasteValue("");
    setSizeWarning("");
    setUploadError("");
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-txt-secondary">
        Image <span className="text-danger">*</span>
      </label>

      {/* ── Preview ─────────────────────────────────────────── */}
      {hasImage && (
        <div className="flex items-start gap-3">
          <img
            src={imageUrl}
            alt="MCQ preview"
            className="max-h-20 rounded-lg border border-border object-contain bg-surface"
            onError={(e) => { e.currentTarget.src = ""; }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-danger hover:text-red-300 border border-danger/30 hover:border-danger/50 bg-danger-light/10 px-2.5 py-1 rounded-lg transition-colors"
          >
            Remove Image
          </button>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────── */}
      {!hasImage && (
        <div>
          {/* Tab bar */}
          <div className="flex gap-0 border border-border rounded-lg overflow-hidden w-fit mb-3">
            <button
              type="button"
              onClick={() => { setTab("upload"); setUploadError(""); }}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 transition-colors ${
                tab === "upload"
                  ? "bg-accent text-white"
                  : "bg-bg text-txt-secondary hover:text-txt-primary hover:bg-bg"
              }`}
            >
              <UploadIcon /> Upload File
            </button>
            <button
              type="button"
              onClick={() => { setTab("url"); setUploadError(""); }}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 transition-colors ${
                tab === "url"
                  ? "bg-accent text-white"
                  : "bg-bg text-txt-secondary hover:text-txt-primary hover:bg-bg"
              }`}
            >
              <LinkIcon /> Paste URL
            </button>
          </div>

          {/* Upload File tab */}
          {tab === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
                id="mcq-image-upload"
              />
              <label
                htmlFor="mcq-image-upload"
                className={`inline-flex items-center gap-2 border text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  uploading
                    ? "border-border text-txt-muted cursor-not-allowed"
                    : "border-border text-txt-secondary hover:border-accent/50 hover:text-amber-600 hover:bg-accent/5"
                }`}
              >
                {uploading ? (
                  <>
                    <Spinner />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadIcon />
                    Choose Image
                  </>
                )}
              </label>
              <p className="text-xs text-txt-muted mt-1.5">
                JPG, PNG, WebP, GIF, SVG max 10 MB
              </p>
            </div>
          )}

          {/* Paste URL tab */}
          {tab === "url" && (
            <div className="flex gap-2">
              <input
                type="text"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                onBlur={commitUrl}
                onKeyDown={handleUrlKeyDown}
                placeholder="https://res.cloudinary.com/…"
                className="flex-1 bg-bg/80 border border-border hover:border-txt-muted focus:ring-2 focus:ring-brand/60 focus:ring-1 focus:ring-accent/30 rounded-lg px-3 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted transition-colors focus:outline-none"
              />
              <button
                type="button"
                onClick={commitUrl}
                disabled={!pasteValue.trim()}
                className="px-3 py-2 bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Messages ─────────────────────────────────────────── */}
      {sizeWarning && (
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-2 rounded-lg">
          ⚠ {sizeWarning}
        </p>
      )}
      {uploadError && (
        <p className="text-xs text-danger bg-danger-light/10 border border-danger/20 px-3 py-2 rounded-lg">
          {uploadError}
        </p>
      )}
    </div>
  );
}
