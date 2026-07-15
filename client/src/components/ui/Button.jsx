/**
 * components/ui/Button.jsx
 *
 * Reusable button. Use everywhere instead of a raw <button> in user-facing
 * components, so colors, padding, radius, and hover/focus states stay
 * consistent across the platform.
 *
 * Props:
 *   variant   "primary" | "secondary" | "danger" | "success" | "ghost"  (default: "primary")
 *   size      "sm" | "md" | "lg"                                       (default: "md")
 *   disabled  boolean
 *   onClick   click handler
 *   type      button type (default: "button")
 *   className extra classes merged onto the button (optional)
 *   children  button content
 */

const VARIANT_STYLES = {
  primary:   "bg-brand text-white hover:bg-brand-dark focus:ring-brand",
  secondary: "bg-surface border border-border text-txt-primary hover:bg-bg focus:ring-border dark:bg-dark-surface dark:border-dark-border dark:text-slate-200 dark:hover:bg-dark-surface2",
  danger:    "bg-danger text-white hover:bg-danger-dark focus:ring-danger",
  success:   "bg-success text-white hover:bg-success-dark focus:ring-success",
  ghost:     "text-txt-secondary hover:text-txt-primary hover:bg-bg focus:ring-border dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-dark-surface2",
};

const SIZE_STYLES = {
  sm: "text-xs px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-lg",
  lg: "text-base px-6 py-3 rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 inline-flex items-center justify-center gap-2 ${variantClass} ${sizeClass} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
