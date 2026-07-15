import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCategories } from "../../context/CategoriesContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import AddTestDropdown from "../../components/admin/AddTestDropdown";
import TestGroupPanel from "../../components/admin/TestGroupPanel";
import { PageTitle, SectionTitle, BodyText } from "../../components/ui/Typography";

// Set document title for the dashboard
document.title = "Admin Dashboard | Pakistan Mock Test";


// ── Add New Category slide-down panel ────────────────────────
function AddCategoryPanel({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function handleSave() {
    setError("");
    if (!name.trim()) return setError("Category name is required.");

    setLoading(true);
    try {
      await api.post("/admin/categories", { name: name.trim(), description: description.trim() });
      toast.success("Category added successfully.");
      setName("");
      setDescription("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
          open
            ? "bg-accent border-accent text-white"
            : "border-accent text-accent hover:bg-accent hover:text-white"
        }`}
      >
        <span className="text-lg leading-none">{open ? "−" : "+"}</span>
        Add New Category
      </button>

      {/* Slide-down panel */}
      {open && (
        <div className="mt-3 bg-surface border border-border rounded-xl p-5 max-w-md">
          <h4 className="text-sm font-semibold text-txt-primary mb-4">New Category</h4>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-txt-secondary block mb-1">
                Category Name <span className="text-danger">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FPSC Tests"
                className="w-full bg-surface border border-border text-txt-primary text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-txt-secondary block mb-1">
                Description <span className="text-txt-muted">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description shown on the category card…"
                rows={3}
                className="w-full bg-surface border border-border text-txt-primary text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand transition resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-danger bg-danger-light/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-accent hover:bg-accent-dark disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center gap-2"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Saving…" : "Save Category"}
              </button>
              <button
                onClick={() => { setOpen(false); setError(""); setName(""); setDescription(""); }}
                className="text-sm text-txt-muted hover:text-txt-secondary px-3 py-2 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status helpers for dashboard summary ─────────────────────

function summaryStatusIcon(status) {
  if (status === "published") return "✓";
  if (status === "mcqs_pending") return "⚙";
  return "⏳"; // settings_pending | in_progress
}

function summaryStatusLabel(status) {
  switch (status) {
    case "published":     return "Published";
    case "mcqs_pending":  return "MCQs Pending";
    case "settings_pending": return "Settings Pending";
    case "in_progress":
    default:              return "In Progress";
  }
}

// ── Dashboard summary for a single custom category ────────────
// Fetches all groups + all tests (every status) via the admin-only
// GET /api/admin/custom-tests/summary/:categorySlug endpoint.
function CategorySummary({ category, navigate }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/custom-tests/summary/${category.slug}`)
      .then(({ data }) => setGroups(data.groups || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [category.slug]);

  if (loading) {
    return (
      <div className="mt-3 space-y-1.5 pl-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-4 bg-bg/60 rounded animate-pulse w-40" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) return null;

  // Only show groups that have at least one test
  const groupsWithTests = groups.filter((g) => g.tests.length > 0);
  if (groupsWithTests.length === 0) return null;

  const totalTests = groupsWithTests.reduce((sum, g) => sum + g.tests.length, 0);

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-2 text-xs font-semibold text-txt-secondary hover:text-txt-primary transition"
      >
        <span>
          {totalTests} test{totalTests !== 1 ? "s" : ""} across {groupsWithTests.length} group
          {groupsWithTests.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 text-txt-muted">
          {expanded ? "Hide" : "Show"}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {expanded && (
      <div className="mt-3 space-y-3">
      {groupsWithTests.map((group) => (
        <div key={group._id}>
          {/* Group name */}
          <p className="text-xs font-semibold text-txt-secondary mb-1">{group.name}</p>

          {/* Tests */}
          <div className="space-y-0.5 pl-3">
            {group.tests.map((test) => {
              const isPublished = test.status === "published";
              const icon  = summaryStatusIcon(test.status);
              const label = summaryStatusLabel(test.status);

              return (
                <div key={test._id} className="flex items-center gap-2">
                  <span
                    className={`text-xs shrink-0 ${
                      isPublished ? "text-success" : "text-accent"
                    }`}
                  >
                    {icon}
                  </span>
                  <span className="text-xs text-txt-secondary">
                    Test {test.testNumber}
                  </span>
                  <span
                    className={`text-xs ${
                      isPublished ? "text-green-500/70" : "text-txt-muted"
                    }`}
                  >
                    {label}
                  </span>
                  {!isPublished && (
                    <button
                      onClick={() =>
                        navigate(`/admin/custom-test/${test._id}/add-mcqs`)
                      }
                      className="text-xs text-accent hover:text-amber-600 font-medium transition"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>
      )}
    </div>
  );
}

// ── Category action button ────────────────────────────────────
// Default categories use the AddTestDropdown (Verbal/Non-Verbal/Academic flow).
// Custom categories use TestGroupPanel (group → test → MCQ flow) +
// CategorySummary (collapsible overview of groups/tests below).
function CategoryButton({ category }) {
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  if (category.isDefault) {
    // Default category: use the existing dropdown (unchanged)
    return (
      <div className="bg-surface border border-border rounded-xl px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center text-sm font-black text-blue-200 shrink-0">
              {category.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-txt-primary truncate">{category.name}</p>
              <p className="text-xs text-txt-muted mt-0.5">3-section test (Verbal · Non-Verbal · Academic)</p>
            </div>
          </div>
          <AddTestDropdown category={category} />
        </div>
      </div>
    );
  }

  // Custom category: header + group panel + summary
  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-sm font-black text-brand shrink-0">
            {category.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-txt-primary truncate">{category.name}</p>
            <p className="text-xs text-txt-muted mt-0.5">Custom tests · Group → Test → MCQs</p>
          </div>
        </div>
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className={`shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition ${
            panelOpen
              ? "bg-accent text-white"
              : "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30"
          }`}
        >
          <span className="text-base leading-none">{panelOpen ? "−" : "+"}</span>
          Add {category.name} Test
        </button>
      </div>

      {/* Group panel (slide-down when button clicked) */}
      {panelOpen && (
        <TestGroupPanel
          category={category}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {/* Dashboard summary — always visible below the header */}
      <CategorySummary category={category} navigate={navigate} />
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────
function SettingsPanel() {
  const [form, setForm] = useState({
    phone: "",
    whatsappNumber: "",
    email: "",
    weekPrice: "",
    monthPrice: "",
    monthOriginalPrice: "",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current settings on mount
  useEffect(() => {
    api
      .get("/settings/contact")
      .then((res) => {
        const d = res.data;
        setForm({
          phone:              d.phone              ?? "",
          whatsappNumber:     d.whatsappNumber     ?? "",
          email:              d.email              ?? "",
          weekPrice:          d.weekPrice          ?? 300,
          monthPrice:         d.monthPrice         ?? 1000,
          monthOriginalPrice: d.monthOriginalPrice ?? 1200,
        });
      })
      .catch(() => toast.error("Failed to load settings."))
      .finally(() => setLoadingData(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch("/admin/settings", {
        phone:              form.phone.trim(),
        whatsappNumber:     form.whatsappNumber.trim(),
        email:              form.email.trim(),
        weekPrice:          Number(form.weekPrice),
        monthPrice:         Number(form.monthPrice),
        monthOriginalPrice: Number(form.monthOriginalPrice),
      });
      toast.success("Settings saved successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 max-w-lg">
      {/* Contact Info */}
      <p className="text-xs font-semibold text-txt-secondary uppercase tracking-widest mb-3">
        Contact Info
      </p>
      <div className="flex flex-col gap-3 mb-5">
        <Field
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="e.g. 03001234567"
        />
        <Field
          label="WhatsApp Number"
          name="whatsappNumber"
          value={form.whatsappNumber}
          onChange={handleChange}
          placeholder="e.g. 923001234567 (with country code, no +)"
        />
        <Field
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="e.g. admin@prepp.pk"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-5" />

      {/* Pricing */}
      <p className="text-xs font-semibold text-txt-muted uppercase tracking-widest mb-3">
        Premium Pricing (PKR)
      </p>
      <div className="flex flex-col gap-3 mb-5">
        <Field
          label="1-Week Price"
          name="weekPrice"
          type="number"
          value={form.weekPrice}
          onChange={handleChange}
          placeholder="300"
        />
        <Field
          label="1-Month Price"
          name="monthPrice"
          type="number"
          value={form.monthPrice}
          onChange={handleChange}
          placeholder="1000"
        />
        <Field
          label="1-Month Original Price (shown struck-through)"
          name="monthOriginalPrice"
          type="number"
          value={form.monthOriginalPrice}
          onChange={handleChange}
          placeholder="1200"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-accent hover:bg-accent-dark disabled:opacity-60 text-white text-sm font-semibold px-6 py-2 rounded-lg transition flex items-center gap-2"
      >
        {saving && (
          <span className="w-3.5 h-3.5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
        )}
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

// Small reusable input field
function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-medium text-txt-secondary block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-surface border border-border text-txt-primary text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand transition"
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { categories, loading, error, refreshCategories } = useAdminCategories();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <PageTitle as="h1">Admin Dashboard</PageTitle>
          <BodyText className="text-sm mt-1">
            Manage categories, add tests, and create user accounts.
          </BodyText>
        </div>
        <a
          href="/admin/users"
          className="shrink-0 bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          View Users
        </a>
      </div>

      {/* Category Management */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-txt-secondary uppercase tracking-widest">
            Category Management
          </h2>
          <span className="text-xs text-txt-muted">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-danger text-sm">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-3 mb-6">
            {categories.map((cat) => (
              <CategoryButton key={cat._id} category={cat} />
            ))}
          </div>
        )}

        {/* Add New Category */}
        <AddCategoryPanel onSuccess={refreshCategories} />
      </section>

      {/* Site Settings */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-txt-secondary uppercase tracking-widest">
            Site Settings
          </h2>
          <p className="text-xs text-txt-muted mt-1">
            Changes here reflect instantly in the Premium Popup and footer no redeploy needed.
          </p>
        </div>
        <SettingsPanel />
      </section>
    </div>
  );
}