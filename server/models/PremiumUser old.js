import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const premiumUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    accessCategories: { type: [String], default: [] },
    duration: { type: String, enum: ["1-week", "1-month"] },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: true if account has passed its expiry date
premiumUserSchema.virtual("isExpired").get(function () {
  return Date.now() > this.expiresAt.getTime();
});

// Hash password before saving if it was changed
premiumUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare a plain password against the stored hash
premiumUserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const PremiumUser = mongoose.model("PremiumUser", premiumUserSchema);
export default PremiumUser;
