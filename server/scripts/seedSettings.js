/**
 * scripts/seedSettings.js  (Prompt 65 + 66)
 *
 * Creates or force-updates the singleton AdminSettings document
 * with default contact info and pricing.
 *
 * Safe to re-run at any time uses $set so it always writes the
 * latest defaults (won't overwrite values you've already customised
 * unless you edit this file).
 *
 * Usage:  node scripts/seedSettings.js
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
      // Contact info edit these to match your real details
      phone:               "03108707438",
      whatsappNumber:      "923108707438",   // international format, no + or spaces
      email:               "admin@prepPK.com",

      // Pricing edit to change what shows in the popup
      weekPrice:           300,
      monthPrice:          1000,
      monthOriginalPrice:  1200,

      _singleton: true,
    },
  },
  { upsert: true, returnDocument: "after" }
);

console.log("✅  AdminSettings seeded:", {
  phone:              result.phone,
  whatsappNumber:     result.whatsappNumber,
  email:              result.email,
  weekPrice:          result.weekPrice,
  monthPrice:         result.monthPrice,
  monthOriginalPrice: result.monthOriginalPrice,
});

await mongoose.disconnect();
