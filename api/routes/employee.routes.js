import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
} from "../controllers/employee.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createEmployeeValidator,
  updateEmployeeValidator,
  employeeIdValidator,
} from "../validators/employee.validator.js";

const router = Router();

router.get("/", protect, getEmployees);
router.get("/:id", protect, validateParams(employeeIdValidator), getEmployee);
router.post("/", protect, restrictTo("admin"), validateBody(createEmployeeValidator), createEmployee);
router.put("/:id", protect, restrictTo("admin"), validateParams(employeeIdValidator), validateBody(updateEmployeeValidator), updateEmployee);
router.patch("/:id/status", protect, restrictTo("admin"), validateParams(employeeIdValidator), toggleEmployeeStatus);
router.delete("/:id", protect, restrictTo("admin"), validateParams(employeeIdValidator), deleteEmployee);

export default router;
