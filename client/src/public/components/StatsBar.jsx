/**
 * src/public/components/StatsBar.jsx — NEW
 *
 * Social proof strip between hero and categories.
 * Animated stat counters that count up on mount, each with its own color identity.
 */

import { useEffect, useRef, useState } from "react";
import {
  PiStudentFill,
  PiTrophyFill,
  PiBooksFill,
  PiStarFill,
} from "react-icons/pi";

function useCountUp(target, duration = 1500, startDelay = 0) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const timer = setTimeout(() => {
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.floor(eased * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setDisplay(target);
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }, startDelay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startDelay]);

  return display;
}

// Each stat has its own color identity — icon, tint, border, glow.
const STATS = [
  {
    value: 12000,
    label: "Students Enrolled",
    icon: PiStudentFill,
    suffix: "+",
    color: "#3B82F6", // blue
    tint: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.3)",
    glow: "rgba(59, 130, 246, 0.35)",
  },
  {
    value: 99,
    label: "Pass Rate",
    icon: PiTrophyFill,
    suffix: "%",
    color: "#F59E0B", // amber/gold
    tint: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.3)",
    glow: "rgba(245, 158, 11, 0.35)",
  },
  {
    value: 50000,
    label: "MCQs Available",
    icon: PiBooksFill,
    suffix: "+",
    color: "#10B981", // emerald
    tint: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
    glow: "rgba(16, 185, 129, 0.35)",
  },
  {
    value: 5,
    label: "Star Rating",
    icon: PiStarFill,
    suffix: ".0",
    color: "#EC4899", // pink
    tint: "rgba(236, 72, 153, 0.15)",
    border: "rgba(236, 72, 153, 0.3)",
    glow: "rgba(236, 72, 153, 0.35)",
  },
];

function StatItem({ value, label, icon: Icon, suffix, color, tint, border, glow, delay }) {
  const count = useCountUp(value, 1800, delay);
  const displayValue =
    value === 50000
      ? `${(count / 1000).toFixed(count >= 50000 ? 0 : 1)}K`
      : value === 12000
        ? `${(count / 1000).toFixed(count >= 12000 ? 0 : 1)}K`
        : count;

  return (
    <div className="flex flex-col items-center gap-1 group cursor-default">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
        style={{
          background: tint,
          border: `1px solid ${border}`,
          boxShadow: `0 0 0 rgba(0,0,0,0)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 20px -4px ${glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
        }}
      >
        <Icon className="text-[26px]" style={{ color }} />
      </div>
      <span className="font-heading font-black text-2xl md:text-3xl gradient-text tabular-nums">
        {displayValue}
        {suffix}
      </span>
      <span className="text-xs text-slate-500 dark:text-purple-300/70 tracking-wide text-center">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section
      className="relative py-10 px-4 border-y border-slate-200 dark:border-brand/20"
      style={{ background: "var(--bg-stats)" }}
    >
      {/* Glow line at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(108,99,255,0.6), transparent)",
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} {...stat} delay={i * 150} />
          ))}
        </div>
      </div>

      {/* Glow line at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(108,99,255,0.4), transparent)",
        }}
      />
    </section>
  );
}