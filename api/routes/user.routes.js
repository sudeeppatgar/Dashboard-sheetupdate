import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { getUsers, createUserHandler, changeRole, toggleStatus } from "../controllers/user.controller.js";
import { validateBody } from "../middleware/validator.middleware.js";
import { registerValidator } from "../validators/user.validator.js";

const router = Router();
router.use(protect, restrictTo("admin"));
router.get("/", getUsers);
router.post("/", validateBody(registerValidator), createUserHandler);
router.patch("/:id/role", changeRole);
router.patch("/:id/status", toggleStatus);

export default router;
