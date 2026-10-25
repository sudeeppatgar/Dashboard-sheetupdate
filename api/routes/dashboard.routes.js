import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { summary } from "../controllers/dashboard.controller.js";

const router = Router();
router.use(protect);
router.get("/summary", summary);
export default router;
