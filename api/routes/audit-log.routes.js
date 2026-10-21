import { Router } from "express";
import { getAuditLogsHandler } from "../controllers/audit-log.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/", protect, restrictTo("admin"), getAuditLogsHandler);
export default router;
