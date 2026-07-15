/**
 * src/components/ui/Typography.jsx  (Prompt 23  Color Polish)
 *
 * Centralised text style components so every page in the platform
 * shares the same visual hierarchy. Always prefer these over raw
 * <h1>/<h2>/<p>/<label> tags with inline classes.
 *
 * Usage:
 *   <PageTitle>Dashboard</PageTitle>
 *   <SectionTitle as="h3">Categories</SectionTitle>
 *   <Label htmlFor="email">Email</Label>
 */

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function PageTitle({ as: Tag = "h1", className = "", children, ...rest }) {
  return (
    <Tag
      className={cx("text-txt-primary dark:text-slate-100 text-3xl md:text-4xl font-bold tracking-tight", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({ as: Tag = "h2", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-primary dark:text-slate-100 text-xl md:text-2xl font-bold", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ as: Tag = "h3", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-primary dark:text-slate-100 text-lg font-semibold", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function BodyText({ as: Tag = "p", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-secondary dark:text-slate-300 text-base leading-relaxed", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Label({ as: Tag = "label", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-secondary dark:text-slate-300 text-sm font-medium", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Muted({ as: Tag = "span", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-muted dark:text-slate-500 text-sm", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Highlight({ as: Tag = "span", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-brand dark:text-blue-400 font-semibold", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Page-level content wrapper  consistent left/right padding + max width. */
export function PageContainer({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={cx("px-4 md:px-8 lg:px-16 max-w-7xl mx-auto", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Table header cell text  consistent across all admin tables. */
export function TableHeaderText({ as: Tag = "span", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-secondary text-xs font-semibold uppercase tracking-wider", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Table cell text  consistent across all admin tables. */
export function TableCellText({ as: Tag = "span", className = "", children, ...rest }) {
  return (
    <Tag className={cx("text-txt-primary text-sm", className)} {...rest}>
      {children}
    </Tag>
  );
}

export default {
  PageTitle,
  SectionTitle,
  CardTitle,
  BodyText,
  Label,
  Muted,
  Highlight,
  PageContainer,
  TableHeaderText,
  TableCellText,
};
