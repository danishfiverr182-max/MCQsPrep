import Admin from "../models/Admin.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createAndSendToken } from "../utils/createAndSendToken.js";

// ── Register ──────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "An account with this email already exists. Please log in.",
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    const admin = new Admin({
      fullName,
      email,
      password,
      verificationCode,
      verificationExpires,
      isVerified: false,
    });

    await admin.save();

    await sendEmail(
      email,
      "Your Admin Verification Code",
      `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e3a5f; margin-bottom: 8px;">Pakistan Mock Test Platform</h2>
        <p style="color: #555; margin-bottom: 24px;">Hi ${fullName}, here is your admin verification code:</p>
        <div style="background: #f4f6f9; border-radius: 8px; padding: 24px; text-align: center;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1e3a5f;">
            ${verificationCode}
          </span>
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 20px;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      `
    );

    return res.status(201).json({
      message: "Verification code sent to your email.",
      email,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ── Verify Code ───────────────────────────────────────────────
export async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (admin.isVerified) {
      return res.status(400).json({ message: "Account already verified. Please log in." });
    }

    if (admin.verificationExpires < Date.now()) {
      await Admin.deleteOne({ _id: admin._id });
      return res.status(400).json({
        message: "Code has expired. Please register again.",
      });
    }

    if (admin.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid code." });
    }

    admin.isVerified = true;
    admin.verificationCode = undefined;
    admin.verificationExpires = undefined;
    await admin.save();

    return createAndSendToken(admin, res);
  } catch (err) {
    console.error("VerifyCode error:", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ── Login ─────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!admin.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return createAndSendToken(admin, res);
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
}

// ── Me (session check) ────────────────────────────────────────
export async function me(req, res) {
  const admin = req.admin;
  return res.json({
    id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    avatar: admin.avatar || null,
  });
}

// ── Logout ────────────────────────────────────────────────────
export async function logout(req, res) {
  res.clearCookie("adminToken", {
    httpOnly: true,
    sameSite: "lax",
  });
  return res.json({ message: "Logged out." });
}
