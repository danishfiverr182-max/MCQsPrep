// Run once to create your first admin account:
// node seedAdmin.js
//
// After running, log in at http://localhost:5173/admin/login
// with the email and password below, then delete this file.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const ADMIN_EMAIL    = "Danishfiverr182@gmail.com";  // change if needed
const ADMIN_PASSWORD = "Admin@12345";                 // change to your preferred password
const ADMIN_NAME     = "Admin";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log("⚠️  Admin already exists nothing to do.");
    process.exit(0);
  }

  const admin = new Admin({
    fullName:   ADMIN_NAME,
    email:      ADMIN_EMAIL.toLowerCase(),
    password:   ADMIN_PASSWORD,   // pre-save hook will hash this
    isVerified: true,             // skip email verification for seed account
  });

  await admin.save();
  console.log("✅ Admin created successfully!");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("\n👉 Log in at http://localhost:5173/admin/login");
  console.log("⚠️  Delete seedAdmin.js after logging in.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
