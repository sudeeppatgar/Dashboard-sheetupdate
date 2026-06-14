import { Router } from "express";

import { login } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validator.middleware.js";
import { loginValidator } from "../validators/user.validator.js";

const router = Router();

router.post("/login", validateBody(loginValidator), login);

export default router;
