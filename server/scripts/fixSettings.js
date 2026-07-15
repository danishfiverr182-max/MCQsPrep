/**
 * scripts/fixSettings.js
 * Run once to force-set the contact fields regardless of whether
 * the document already exists.
 *
 * Usage: node scripts/fixSettings.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import AdminSettings from "../models/AdminSettings.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log("✅  Connected to MongoDB");

const result = await AdminSettings.findOneAndUpdate(
  { _singleton: true },
  {
    $set: {
      phone:          "03108707438",
      whatsappNumber: "923108707438",
      email:          "admin@prepPK.com",
      _singleton:     true,
    },
  },
  { upsert: true, returnDocument: "after" }
);

console.log("✅  Settings updated:", result);
await mongoose.disconnect();
