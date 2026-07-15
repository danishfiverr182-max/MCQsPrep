/**
 * routes/sitemap.js  (Prompt 69 SEO Essentials)
 *
 * GET /sitemap.xml
 *   Dynamically builds an XML sitemap at request time.
 *   Includes:
 *     - Static public pages (/, /free-mock-tests)
 *     - One <url> per live category (slug sourced from MongoDB)
 *
 * Cache: public, max-age=3600 (1 hour) categories change rarely.
 *
 * No auth required.  Bots hit this directly.
 */

import { Router } from "express";
import Category from "../models/Category.js";

const router = Router();

// ── Helper: escape XML special characters ─────────────────────
function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Helper: build a single <url> block ────────────────────────
function urlEntry(loc, { lastmod, changefreq = "weekly", priority = "0.7" } = {}) {
  const today = new Date().toISOString().split("T")[0];
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// ── GET /sitemap.xml ──────────────────────────────────────────
router.get("/sitemap.xml", async (req, res) => {
  try {
    // Determine the public base URL.
    // In production this should be set via CLIENT_URL env var
    // (e.g. https://www.prepkp.com).  Falls back to request host.
    const base =
      process.env.CLIENT_URL ||
      `${req.protocol}://${req.get("host")}`;

    // Fetch all categories only need slug + updatedAt
    const categories = await Category.find()
      .sort({ order: 1 })
      .select("slug updatedAt");

    // ── Static pages ──────────────────────────────────────────
    const staticUrls = [
      urlEntry(`${base}/`, {
        changefreq: "daily",
        priority: "1.0",
      }),
      urlEntry(`${base}/free-mock-tests`, {
        changefreq: "daily",
        priority: "0.9",
      }),
    ];

    // ── Category pages ────────────────────────────────────────
    const categoryUrls = categories.map((cat) => {
      const lastmod = cat.updatedAt
        ? cat.updatedAt.toISOString().split("T")[0]
        : undefined;
      return urlEntry(`${base}/category/${cat.slug}`, {
        lastmod,
        changefreq: "weekly",
        priority: "0.8",
      });
    });

    // ── Assemble XML ──────────────────────────────────────────
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticUrls.join("")}
${categoryUrls.join("")}
</urlset>`;

    // 1-hour public cache bots crawl infrequently
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (err) {
    console.error("GET /sitemap.xml error:", err.message);
    return res.status(500).send("<?xml version=\"1.0\"?><error>sitemap unavailable</error>");
  }
});

export default router;
