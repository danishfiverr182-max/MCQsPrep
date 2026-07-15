/**
 * EditCategoryDetailsModal.jsx  (Prompt 03 follow-up)
 *
 * The original category creation flow (AddCategoryDropdown) only ever
 * collected a name there was no way for the admin to set a description
 * or cover image, either at creation or afterward. This modal fills that
 * gap for EXISTING categories (including the default Army/Navy/Air Force
 * ones, which predate this feature and have no cover image yet).
 *
 * Flow:
 *   1. Admin picks an image file -> uploaded immediately to
 *      POST /api/admin/categories/upload-cover (Cloudinary), returns
 *      { url, publicId }.
 *   2. Admin edits the description textarea.
 *   3. "Save Changes" -> PATCH /api/admin/categories/:slug with
 *      { description, image, imagePublicId }.
 *   4. Calls refreshCategories() so the admin dashboard AND the public
 *      homepage (via PublicCategoriesContext on its next fetch) reflect
 *      the change.
 */

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAdminCategories } from "../../context/CategoriesContext";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function EditCategoryDetailsModal({ category, onClose }) {
  const { refreshCategories } = useAdminCategories();
  const fileInputRef = useRef(null);

  const [description, setDescription] = useState(category.description || "");
  const [imageUrl, setImageUrl]       = useState(category.image || "");
  const [imagePublicId, setImagePublicId] = useState(category.imagePublicId || "");
  const [previewUrl, setPreviewUrl]   = useState(category.image || "");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

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

    // Show an instant local preview while the upload is in flight
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
      setPreviewUrl(category.image || "");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (description.trim().length > 300) {
      setError("Description must be 300 characters or fewer.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await api.patch(`/admin/categories/${category.slug}`, {
        description: description.trim(),
        image: imageUrl,
        imagePublicId,
      });

      await refreshCategories();
      toast.success("Category details updated.");
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save changes.";
      setError(message);
      toast.error(message, { id: "edit-cat-error" });
    } finally {
      setSaving(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-txt-primary">Edit Category Details</h2>
            <p className="text-xs text-txt-secondary mt-0.5">{category.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-txt-secondary hover:text-txt-primary transition p-1 rounded-lg hover:bg-surface"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Cover image */}
          <div>
            <label className="block text-sm text-txt-secondary mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-surface border border-border shrink-0 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-txt-secondary">No image</span>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || saving}
                  className="text-xs font-semibold bg-surface hover:bg-bg border border-border text-txt-primary px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? <><Spinner /> Uploading…</> : (imageUrl ? "Replace image" : "Upload image")}
                </button>
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
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-cat-description" className="block text-sm text-txt-secondary mb-1.5">
              Description
            </label>
            <textarea
              id="edit-cat-description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
              maxLength={301}
              rows={3}
              placeholder="A short description shown on the homepage card…"
              disabled={saving}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand focus:ring-accent/20 transition-colors disabled:opacity-50 resize-none"
            />
            <p className={`text-xs mt-1 text-right ${description.length > 300 ? "text-danger" : "text-txt-secondary"}`}>
              {description.length}/300
            </p>
          </div>

          {error && <p className="text-danger text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-border shrink-0 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            {saving && <Spinner />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 text-txt-secondary hover:text-txt-primary border border-border hover:border-txt-muted text-sm py-2.5 rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
