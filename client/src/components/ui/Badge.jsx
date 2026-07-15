/**
 * components/ui/Badge.jsx
 *
 * Reusable status / label badge. Use everywhere a small colored pill is
 * needed: Pass/Fail, Active/Expired, Published/Pending, FREE, PREMIUM, etc.
 *
 * Props:
 *   variant   "success" | "danger" | "warning" | "info" | "muted"  (default: "muted")
 *   children  badge text/content
 *   className extra classes merged onto the badge (optional)
 */

const VARIANT_STYLES = {
  success: "bg-success-light text-success-darker border border-success/30 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/30",
  danger:  "bg-danger-light text-danger-darker border border-danger/30 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/30",
  warning: "bg-accent-light text-accent-darker border border-accent/30 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30",
  info:    "bg-brand-light text-brand border border-brand/30 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30",
  muted:   "bg-bg text-txt-muted border border-border dark:bg-dark-surface2 dark:text-slate-400 dark:border-dark-border",
};

export default function Badge({ variant = "muted", children, className = "", ...rest }) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.muted;

  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
