/**
 * config/cloudinary.js  (Part 4 Prompt 05)
 *
 * Configures the Cloudinary Node.js SDK using credentials stored in .env.
 * Import `cloudinary` from this file wherever uploads are needed.
 *
 * Required .env variables:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true, // always return https URLs
});

export default cloudinary;
