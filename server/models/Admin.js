import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, default: null },

    googleId: { type: String, default: null },
    avatar:   { type: String, default: null },

    isVerified:           { type: Boolean, default: false },
    verificationCode:     { type: String,  default: null },
    verificationExpires:  { type: Date,    default: null },

    failedAttempts: { type: Number, default: 0 },
    lockUntil:      { type: Date,   default: null },
  },
  { timestamps: true }
);

// ── Virtual: is the account currently locked? ─────────────────
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Hash password before saving ───────────────────────────────
// Mongoose 8+ with bcryptjs 3+ works best without the next() callback.
// Set doc._passwordAlreadyHashed = true to skip hashing (e.g. when the
// route already hashed the password before storing it in pendingMap).
adminSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  if (this._passwordAlreadyHashed) return; // already hashed by the route
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Compare plain password to stored hash ────────────────────
adminSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Brute-force: increment failed attempts ────────────────────
adminSchema.methods.incFailedAttempts = async function () {
  const MAX_ATTEMPTS  = 5;
  const LOCK_DURATION = 15 * 60 * 1000;

  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedAttempts = 0;
    this.lockUntil      = null;
  }

  this.failedAttempts += 1;

  if (this.failedAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_DURATION);
  }

  return this.save();
};

// ── Brute-force: reset on successful login ────────────────────
adminSchema.methods.resetFailedAttempts = async function () {
  this.failedAttempts = 0;
  this.lockUntil      = null;
  return this.save();
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
