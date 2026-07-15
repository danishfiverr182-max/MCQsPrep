/**
 * AddCategoryDropdown  (Prompt 03 follow-up)
 *
 * Previously this form only collected a category name. Now also collects
 * an optional description and cover image (uploaded immediately to
 * Cloudinary on file select), so a new category can ship with everything
 * the homepage card needs in one step.
 */

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAdminCategories } from "../../context/CategoriesContext";

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-txt-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function AddCategoryDropdown({ onClose }) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl]       = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [previewUrl, setPreviewUrl]   = useState("");

  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const { refreshCategories } = useAdminCategories();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function validate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return false;
    }
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return false;
    }
    if (trimmed.length > 80) {
      setError(`Name is too long max 80 characters (currently ${trimmed.length}).`);
      return false;
    }
    if (description.trim().length > 300) {
      setError("Description must be 300 characters or fewer.");
      return false;
    }
    return true;
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setError("");
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post("/admin/categories/upload-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageUrl(data.url);
      setImagePublicId(data.publicId);
      setPreviewUrl(data.url);
      toast.success("Cover image uploaded.");
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed. Please try again.");
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setImageUrl("");
    setImagePublicId("");
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    setError("");
    if (!validate()) return;

    setSaving(true);
    try {
      await api.post("/admin/categories", {
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
        imagePublicId,
      });

      await refreshCategories();

      toast.success("Category added successfully.");
      setName("");
      setDescription("");
      clearImage();
      inputRef.current?.focus();

      setTimeout(() => onClose(), 1200);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setError("This category already exists.");
      } else if (status === 422) {
        setError(message || "Invalid input.");
      } else {
        setError(message || "Something went wrong. Please try again.");
        toast.error(message || "Failed to save category.", { id: "add-cat-error" });
      }
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") handleSave();
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="mt-3 bg-surface border border-border rounded-2xl p-5 shadow-xl">
      <p className="text-xs font-semibold text-txt-secondary uppercase tracking-widest mb-3">
        New Category
      </p>

      <label htmlFor="new-category-name" className="block text-sm text-txt-secondary mb-1.5">
        Category Name
      </label>
      <input
        id="new-category-name"
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(""); }}
        onKeyDown={handleKeyDown}
        maxLength={81}
        placeholder="e.g. FPSC Tests"
        disabled={saving}
        className={`w-full bg-surface border rounded-lg px-4 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted
          focus:outline-none focus:ring-2 transition-colors
          ${error
            ? "border-danger focus:ring-red-500/30"
            : "border-border focus:ring-2 focus:ring-brand focus:ring-accent/20"
          }
          disabled:opacity-50`}
      />

      <p className={`text-xs mt-1 text-right ${name.length > 80 ? "text-danger" : "text-txt-muted"}`}>
        {name.length}/80
      </p>

      <label htmlFor="new-category-description" className="block text-sm text-txt-secondary mb-1.5 mt-4">
        Description <span className="text-txt-muted">(optional)</span>
      </label>
      <textarea
        id="new-category-description"
        value={description}
        onChange={(e) => { setDescription(e.target.value); setError(""); }}
        onKeyDown={handleKeyDown}
        maxLength={301}
        rows={2}
        placeholder="Shown on the homepage card, e.g. Verbal, Non-Verbal & Academic MCQs for Army recruitment."
        disabled={saving}
        className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand focus:ring-accent/20 transition-colors disabled:opacity-50 resize-none"
      />
      <p className={`text-xs mt-1 text-right ${description.length > 300 ? "text-danger" : "text-txt-secondary"}`}>
        {description.length}/300
      </p>

      <label className="block text-sm text-txt-secondary mb-1.5 mt-4">
        Cover Image <span className="text-txt-muted">(optional)</span>
      </label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-16 rounded-lg overflow-hidden bg-surface border border-border shrink-0 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-txt-secondary">No image</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || saving}
              className="text-xs font-semibold bg-surface hover:bg-bg border border-border text-txt-primary px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? <><Spinner /> Uploading…</> : (imageUrl ? "Replace image" : "Upload image")}
            </button>
            {imageUrl && !uploading && (
              <button
                type="button"
                onClick={clearImage}
                disabled={saving}
                className="text-xs text-txt-muted hover:text-danger transition"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-txt-muted mt-1.5">JPG, PNG, GIF or WEBP. Max 5MB.</p>
        </div>
      </div>

      {error && (
        <p className="text-danger text-xs mt-3 mb-1">{error}</p>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60
            text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {saving ? <><Spinner /> Saving…</> : "Save"}
        </button>

        <button
          onClick={onClose}
          disabled={saving}
          className="text-sm text-txt-secondary hover:text-txt-primary transition-colors
            focus:outline-none focus:underline disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
