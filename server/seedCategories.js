import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";

dotenv.config();

const defaultCategories = [
  {
    name: "Pak Army",
    slug: "pak-army",
    description: "Mock tests for Pakistan Army initial tests and written exams.",
    isDeletable: false,
    isDefault: true,
    order: 1,
  },
  {
    name: "Pak Navy",
    slug: "pak-navy",
    description: "Mock tests for Pakistan Navy recruitment and selection tests.",
    isDeletable: false,
    isDefault: true,
    order: 2,
  },
  {
    name: "Pak Air Force",
    slug: "pak-air-force",
    description: "Mock tests for Pakistan Air Force initial and aptitude tests.",
    isDeletable: false,
    isDefault: true,
    order: 3,
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    let seededCount = 0;

    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`  ✅ Created: ${cat.name}`);
        seededCount++;
      } else {
        // Always enforce isDeletable:false on defaults cannot be overridden via DB
        if (existing.isDeletable !== false) {
          await Category.updateOne({ slug: cat.slug }, { isDeletable: false, isDefault: true });
          console.log(`  🔒 Locked defaults for: ${cat.name}`);
        } else {
          console.log(`  ⏭  Already exists: ${cat.name}`);
        }
      }
    }

    if (seededCount > 0) {
      console.log(`\n✅ ${seededCount} default categor${seededCount === 1 ? "y" : "ies"} seeded`);
    } else {
      console.log("\nAll categories already exist nothing to seed");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCategories();
