/**
 * src/components/ui/LogoMark.jsx
 *
 * Shared brand mark — shield + checkmark icon paired with the
 * "PrepPk" wordmark. Replaces the old purple "P" square + text
 * logo previously duplicated across Navbar, Footer, and the mobile
 * nav overlay. Colors use Tailwind dark: variants so it adapts to
 * the site's light/dark theme automatically.
 */

let uid = 0;

export default function LogoMark({
  size = 28,
  withTagline = false,
  className = "",
}) {
  // Unique gradient id per instance so multiple logos on one page
  // (navbar + footer, or navbar + mobile overlay) don't collide.
  const gradientId = `preppkShield-${uid++}`;

  return (
    <span className={`flex items-center gap-2 min-w-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 190"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E8064" />
            <stop offset="100%" stopColor="#0A5C46" />
          </linearGradient>
        </defs>
        <path
          d="M80,4 L146,30 L146,106 Q146,162 80,186 Q14,162 14,106 L14,30 Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M46,96 L70,122 L116,64"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="min-w-0 flex flex-col leading-none">
        <span className="font-heading font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
          Prep
          <span className="text-[#0A5C46] dark:text-[#2FD9AC]">Pk</span>
        </span>
        {withTagline && (
          <span className="text-black dark:text-purple-300/60 text-[9px] hidden sm:block leading-none mt-2 tracking-widest uppercase">
            Mock Test Platform
          </span>
        )}
      </span>
    </span>
  );
}
