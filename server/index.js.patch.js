// ─────────────────────────────────────────────────────────────────────────────
// PATCH: server/index.js
// Add two lines: one import and one app.use() call.
// ─────────────────────────────────────────────────────────────────────────────

// 1. ADD this import after the scoringRoutes import (around line 58):
//
//    import scoringRoutes from "./routes/scoringRoutes.js";
//
// ↓ ADD AFTER:

import testGroupRoutes from "./routes/testGroupRoutes.js";

// ─────────────────────────────────────────────────────────────────────────────

// 2. ADD this app.use() call after the scoring routes mount (around line 235):
//
//    app.use("/api/results", scoringRoutes);
//
// ↓ ADD AFTER:

// Test groups and custom category tests (custom categories: KPPSC, FPSC, etc.)
app.use("/api", testGroupRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// That's all. No other changes to index.js are needed for Prompt 1.
// ─────────────────────────────────────────────────────────────────────────────
