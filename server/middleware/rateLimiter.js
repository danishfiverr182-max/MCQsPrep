import rateLimit from "express-rate-limit";

// ── loginLimiter ──────────────────────────────────────────────
// Applied to POST /login and POST /auth/google
// 10 requests per 15 minutes per IP address
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    message:
      "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: false, // count every request, successful or not
});

// ── codeLimiter ───────────────────────────────────────────────
// Applied to POST /verify-code and POST /resend-code
// 5 requests per 10 minutes per IP address
export const codeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many code attempts from this IP. Please wait 10 minutes before trying again.",
  },
});
