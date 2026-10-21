import { Router } from "express";
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdValidator,
} from "../validators/department.validator.js";

const router = Router();

router.get("/", protect, getDepartments);
router.get("/:id", protect, validateParams(departmentIdValidator), getDepartment);
router.post("/", protect, restrictTo("admin"), validateBody(createDepartmentValidator), createDepartment);
router.put("/:id", protect, restrictTo("admin"), validateParams(departmentIdValidator), validateBody(updateDepartmentValidator), updateDepartment);
router.patch("/:id/status", protect, restrictTo("admin"), validateParams(departmentIdValidator), toggleDepartmentStatus);
router.delete("/:id", protect, restrictTo("admin"), validateParams(departmentIdValidator), deleteDepartment);

export default router;
