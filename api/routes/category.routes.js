import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  categoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo("admin"), validateBody(createCategoryValidator), createCategory);
router.get("/", getCategories);
router.get("/:id", validateParams(categoryIdValidator), getCategory);
router.put("/:id", restrictTo("admin"), validateParams(categoryIdValidator), validateBody(updateCategoryValidator), updateCategory);
router.delete("/:id", restrictTo("admin"), validateParams(categoryIdValidator), deleteCategory);

export default router;
