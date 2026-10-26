import { Router } from "express";

import { login, registerAdmin } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validator.middleware.js";
import { loginValidator, registerAdminValidator } from "../validators/user.validator.js";

const router = Router();

router.post("/login", validateBody(loginValidator), login);
router.post("/register", validateBody(registerAdminValidator), registerAdmin);

export default router;
