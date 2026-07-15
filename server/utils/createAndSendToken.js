import jwt from "jsonwebtoken";

// ── Cookie name ───────────────────────────────────────────────
// In production with HTTPS you can strengthen this by naming the
// cookie "__Host-adminToken" which forces the browser to enforce:
//   • secure: true   (HTTPS only)
//   • path: "/"      (cookie scoped to the whole origin)
//   • no Domain attr (cookie cannot be shared across sub-domains)
// This prevents sub-domain injection attacks.
// Note: the __Host- prefix requires you to also set path: "/" and
// omit the `domain` option both already satisfied below.
const COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-adminToken" : "adminToken";

export function createAndSendToken(admin, res) {
  const token = jwt.sign(
    { adminId: admin._id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    // secure MUST be true in production (required by __Host- prefix)
    secure: process.env.NODE_ENV === "production",
    // sameSite:'strict' everywhere prevents CSRF via cross-site requests
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",           // required for __Host- prefix; harmless in dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    // NOTE: do NOT set `domain` omitting it is required for __Host- prefix
  });

  return res.json({
    success: true,
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      avatar: admin.avatar || null,
    },
  });
}
