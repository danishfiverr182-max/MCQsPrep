// ── Avatar background palette ───────────────────────────────
// A small fixed palette, picked deterministically from the name,
// so the same admin always gets the same color.
const PALETTE = [
  "#1e3a5f", // navy
  "#7c3aed", // violet
  "#0f766e", // teal
  "#b45309", // amber
  "#be123c", // rose
  "#3730a3", // indigo
  "#15803d", // green
  "#9333ea", // purple
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name) {
  const key = name || "Admin";
  return PALETTE[hashString(key) % PALETTE.length];
}

// ── AdminAvatar ───────────────────────────────────────────────
// Props:
//   name    admin's display name (used for initials + color)
//   avatar  Google photo URL, or null/undefined
//   size    pixel size, default 36
export default function AdminAvatar({ name, avatar, size = 36 }) {
  const dimension = `${size}px`;

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || "Admin"}
        referrerPolicy="no-referrer"
        style={{ width: dimension, height: dimension }}
        className="rounded-full object-cover border border-border"
      />
    );
  }

  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        backgroundColor: getColor(name),
        fontSize: size * 0.4,
      }}
      className="rounded-full flex items-center justify-center text-txt-primary font-semibold select-none"
      aria-label={name || "Admin"}
    >
      {getInitials(name)}
    </div>
  );
}
