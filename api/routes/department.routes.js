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
import { validate } from "../middleware/validator.middleware.js";
import {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdValidator,
} from "../validators/department.validator.js";

const router = Router();

router.get("/", protect, getDepartments);
router.get("/:id", protect, validate(departmentIdValidator, "params"), getDepartment);
router.post("/", protect, restrictTo("admin"), validate(createDepartmentValidator), createDepartment);
router.put("/:id", protect, restrictTo("admin"), validate(departmentIdValidator, "params"), validate(updateDepartmentValidator), updateDepartment);
router.patch("/:id/status", protect, restrictTo("admin"), validate(departmentIdValidator, "params"), toggleDepartmentStatus);
router.delete("/:id", protect, restrictTo("admin"), validate(departmentIdValidator, "params"), deleteDepartment);

export default router;
