import { Router } from "express";
import { getAllCategories, createCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getAllCategories);
router.post("/", protect, createCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
