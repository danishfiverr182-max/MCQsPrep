/**
 * StatCard
 *
 * Props:
 *   icon        SVG element shown at the top of the card
 *   label       text label shown below the number
 *   value       final numeric value to count up to
 *   loading     if true, renders a skeleton placeholder
 *   accentClass Tailwind class for icon container background
 *   subtitle    optional small line below the label (e.g. "12 active")
 */

import { useEffect, useState } from "react";

const DURATION_MS = 800;
const STEPS       = 40;

export default function StatCard({
  icon,
  label,
  value,
  loading = false,
  accentClass = "bg-blue-900",
  subtitle = null,
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (loading || typeof value !== "number") return;

    if (value === 0) {
      setDisplayed(0);
      return;
    }

    let step = 0;
    const interval = DURATION_MS / STEPS;

    const timer = setInterval(() => {
      step += 1;
      const progress = step / STEPS;
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));

      if (step >= STEPS) {
        setDisplayed(value);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [value, loading]);

  // ── Skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 min-w-[140px] bg-surface border border-border rounded-2xl p-5 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-bg mb-4" />
        <div className="h-8 w-16 bg-bg rounded-lg mb-2" />
        <div className="h-3 w-24 bg-bg rounded" />
        <div className="h-3 w-16 bg-bg rounded mt-1.5" />
      </div>
    );
  }

  // ── Rendered card ─────────────────────────────────────────────
  return (
    <div className="flex-1 min-w-[140px] bg-surface border border-border hover:border-txt-muted rounded-2xl p-5 transition group">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl ${accentClass} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>

      {/* Animated count */}
      <p className="text-3xl font-bold text-txt-primary tabular-nums leading-none">
        {displayed.toLocaleString()}
      </p>

      {/* Label */}
      <p className="text-xs font-medium text-txt-secondary mt-1.5 uppercase tracking-wide">
        {label}
      </p>

      {/* Subtitle (e.g. "12 active") */}
      {subtitle && (
        <p className="text-xs text-success mt-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
