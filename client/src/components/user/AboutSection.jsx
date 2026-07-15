/**
 * src/components/user/AboutSection.jsx
 *
 * Shared "About This Exam" / blog content block. Renders the admin-authored
 * HTML from the SEO & Content tab. Used by both the default category page
 * (CategoryPage.jsx) and the custom category layout (CustomCategoryLayout.jsx)
 * so blog content shows up regardless of category type.
 *
 * Requires the @tailwindcss/typography plugin (see tailwind.config.js) for
 * the `prose` classes to style <h2>, <p>, <ul>, etc.
 *
 * Inline style="" attributes on elements ALWAYS win over prose class styles
 * because CSS inline styles have higher specificity than any class selector.
 * So <h2 style="color: red; font-size: 28px;"> works exactly as written.
 */
export default function AboutSection({ blogContent }) {
  return (
    <div className="mt-14 border-t border-gray-100 dark:border-dark-border pt-10">
      <h2 className="text-lg font-bold text-txt-primary dark:text-slate-100 mb-4">About This Exam</h2>
      {blogContent ? (
        // blogContent is written exclusively by the admin (not user input),
        // so dangerouslySetInnerHTML is acceptable here — XSS risk is low.
        //
        // `not-prose` is intentionally NOT used here so that bare tags like
        // <h2>, <p>, <ul> get visual styling from the typography plugin.
        // Any inline style="" the admin writes takes precedence over prose
        // styles automatically (CSS specificity: inline > class).
        <div
          className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blogContent }}
        />
      ) : (
        <p className="text-sm text-txt-muted dark:text-slate-500 italic">
          Detailed information about this exam will be available soon.
        </p>
      )}
    </div>
  );
}
