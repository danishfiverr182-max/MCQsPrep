/**
 * src/hooks/useSeoMeta.js  (Prompt 69 SEO Essentials)
 *
 * Returns the title, description, and JSON-LD structured-data object
 * for a given page type.  Components pass the returned values straight
 * into <Helmet> tags so logic stays out of the JSX.
 *
 * Supported page types:
 *   "home"         platform homepage
 *   "category"     per-category test listing
 *   "free-tests"   free mock tests listing
 *   "test"         individual test hub (takes testTitle)
 *
 * Usage:
 *   const { title, description, jsonLd } = useSeoMeta("category", {
 *     categoryName: "Pakistan Army",
 *     testCount: 12,
 *   });
 */

const SITE_NAME = "PrepPK";
const BASE_URL  = import.meta.env.VITE_PUBLIC_URL || "https://www.prepkp.com";

// ── Shared Organisation JSON-LD ───────────────────────────────
const orgSchema = {
  "@type": "Organization",
  "@id":   `${BASE_URL}/#organization`,
  name:    SITE_NAME,
  url:     BASE_URL,
};

// ── WebSite schema (used on every page) ──────────────────────
const websiteSchema = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  "@id":      `${BASE_URL}/#website`,
  url:        BASE_URL,
  name:       SITE_NAME,
  publisher:  { "@id": `${BASE_URL}/#organization` },
  potentialAction: {
    "@type":       "SearchAction",
    target:        `${BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// ── EducationalOrganisation schema ─────────────────────────────
const eduOrgSchema = {
  "@context": "https://schema.org",
  "@type":    "EducationalOrganization",
  "@id":      `${BASE_URL}/#eduorg`,
  name:       SITE_NAME,
  url:        BASE_URL,
  description:
    "Pakistan's competitive exam prep platform for Army, Navy & Air Force initial tests.",
};

// ── Page configs ──────────────────────────────────────────────
function buildMeta(type, opts = {}) {
  switch (type) {
    // ── Home ─────────────────────────────────────────────────
    case "home": {
      const title = `${SITE_NAME} | Free Pakistan Army, Navy & Air Force Mock Tests 2025`;
      const description =
        "Prepare for Pakistan Army, Navy, and Air Force initial tests with free mock tests. 500+ MCQs covering Verbal, Non-Verbal, and Academic sections.";
      const jsonLd = [
        websiteSchema,
        eduOrgSchema,
        {
          "@context": "https://schema.org",
          "@type":    "WebPage",
          "@id":      `${BASE_URL}/#webpage`,
          url:        BASE_URL,
          name:       title,
          description,
          isPartOf:   { "@id": `${BASE_URL}/#website` },
          publisher:  orgSchema,
        },
      ];
      return { title, description, jsonLd };
    }

    // ── Category ──────────────────────────────────────────────
    case "category": {
      const { categoryName = "", slug = "", testCount } = opts;
      const title = `${categoryName} Mock Test 2025 | Online Practice | ${SITE_NAME}`;
      const description = `Prepare for ${categoryName} initial test with official-style MCQs. ${
        testCount ? `${testCount} tests available ` : ""
      }Free and premium mock tests covering Verbal, Non-Verbal, and Academic sections.`;
      const pageUrl = `${BASE_URL}/category/${slug}`;
      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type":    "Course",
          "@id":      `${pageUrl}#course`,
          name:       `${categoryName} Initial Test Preparation`,
          description,
          url:        pageUrl,
          provider:   orgSchema,
          educationalLevel: "competitive exam",
          hasCourseInstance: {
            "@type":         "CourseInstance",
            courseMode:      "online",
            instructor:      orgSchema,
          },
        },
        {
          "@context": "https://schema.org",
          "@type":    "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home",     item: BASE_URL },
            { "@type": "ListItem", position: 2, name: categoryName, item: pageUrl },
          ],
        },
      ];
      return { title, description, jsonLd };
    }

    // ── Free Tests ───────────────────────────────────────────
    case "free-tests": {
      const title = `Free Mock Tests | Pakistan Competitive Exam Practice | ${SITE_NAME}`;
      const description =
        "Access free mock tests for Pakistan Army, Navy, and Air Force initial exams. Practice Verbal, Non-Verbal, and Academic MCQs no signup required.";
      const pageUrl = `${BASE_URL}/free-mock-tests`;
      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type":    "WebPage",
          "@id":      `${pageUrl}#webpage`,
          url:        pageUrl,
          name:       title,
          description,
          isPartOf:   { "@id": `${BASE_URL}/#website` },
        },
        {
          "@context": "https://schema.org",
          "@type":    "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home",           item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Free Mock Tests", item: pageUrl },
          ],
        },
      ];
      return { title, description, jsonLd };
    }

    // ── Individual test hub ──────────────────────────────────
    case "test": {
      const { testTitle = "Mock Test", categoryName = "" } = opts;
      const title = `${testTitle}${categoryName ? ` ${categoryName}` : ""} | ${SITE_NAME}`;
      const description = `Take the ${testTitle} online practice test${
        categoryName ? ` for ${categoryName}` : ""
      }. Timed MCQs for Verbal, Non-Verbal, and Academic sections.`;
      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type":    "Quiz",
          name:       testTitle,
          description,
          provider:   orgSchema,
          educationalUse: "practice",
        },
      ];
      return { title, description, jsonLd };
    }

    // ── Fallback ──────────────────────────────────────────────
    default:
      return {
        title:       `${SITE_NAME} | Pakistan Exam Preparation`,
        description: "Pakistan's competitive exam prep platform.",
        jsonLd:      [],
      };
  }
}

/**
 * useSeoMeta(type, opts)
 *
 * @param {string} type  "home" | "category" | "free-tests" | "test"
 * @param {object} opts  page-specific options (categoryName, slug, etc.)
 * @returns {{ title: string, description: string, jsonLd: object[] }}
 */
export function useSeoMeta(type, opts = {}) {
  return buildMeta(type, opts);
}
