import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  summary,
  byStatus,
  byCategory,
  byDepartment,
  warrantyExpiring,
} from "../controllers/dashboard.controller.js";

const router = Router();
router.use(protect);
router.get("/summary", summary);
router.get("/assets-by-status", byStatus);
router.get("/assets-by-category", byCategory);
router.get("/assets-by-department", byDepartment);
router.get("/warranty-expiring", warrantyExpiring);
export default router;
