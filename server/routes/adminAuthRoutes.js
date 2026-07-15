import { Router } from "express";
import { register, verifyCode, login, me, logout } from "../controllers/adminAuthController.js";
import { protect } from "../middleware/adminAuth.js";

const router = Router();

router.post("/register", register);
router.post("/verify-code", verifyCode);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);

export default router;
