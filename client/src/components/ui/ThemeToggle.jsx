/**
 * src/components/ui/ThemeToggle.jsx
 *
 * Prompt 29 — Dark Mode toggle button.
 * Single icon button that flips between light/dark theme via
 * ThemeContext. Shows a moon icon in light mode (click to go dark)
 * and a sun icon in dark mode (click to go light), with a tooltip
 * and a smooth rotation animation on click.
 */

import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function MoonIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function SunIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const [spin, setSpin] = useState(false);
  const isDark = theme === "dark";

  function handleClick() {
    toggleTheme();
    setSpin(true);
    window.setTimeout(() => setSpin(false), 300);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white rounded-full p-2 transition ${className}`}
    >
      <span
        className="block transition-transform duration-300 ease-out"
        style={{ transform: spin ? "rotate(180deg)" : "rotate(0deg)" }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
