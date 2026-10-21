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
import { validate } from "../middleware/validator.middleware.js";
import {
  createEmployeeValidator,
  updateEmployeeValidator,
  employeeIdValidator,
} from "../validators/employee.validator.js";

const router = Router();

router.get("/", protect, getEmployees);
router.get("/:id", protect, validate(employeeIdValidator, "params"), getEmployee);
router.post("/", protect, restrictTo("admin"), validate(createEmployeeValidator), createEmployee);
router.put("/:id", protect, restrictTo("admin"), validate(employeeIdValidator, "params"), validate(updateEmployeeValidator), updateEmployee);
router.patch("/:id/status", protect, restrictTo("admin"), validate(employeeIdValidator, "params"), toggleEmployeeStatus);
router.delete("/:id", protect, restrictTo("admin"), validate(employeeIdValidator, "params"), deleteEmployee);

export default router;
