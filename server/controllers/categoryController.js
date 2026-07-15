import Category from "../models/Category.js";

// ── GET /api/categories ───────────────────────────────────────
export async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ order: 1 });
    return res.json(categories);
  } catch (err) {
    console.error("getAllCategories error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
}

// ── POST /api/categories  (admin only) ────────────────────────
export async function createCategory(req, res) {
  try {
    const { name, description, image } = req.body;

    // Auto-generate slug: lowercase, spaces → hyphens, strip special chars
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "A category with this name already exists." });
    }

    // Place new category after existing ones
    const count = await Category.countDocuments();

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      isDefault: false,
      order: count + 1,
    });

    return res.status(201).json(category);
  } catch (err) {
    console.error("createCategory error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
}

// ── DELETE /api/categories/:id  (admin only) ─────────────────
export async function deleteCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    if (category.isDefault) {
      return res.status(403).json({ message: "Default categories cannot be deleted." });
    }

    await category.deleteOne();
    return res.json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error("deleteCategory error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
}
