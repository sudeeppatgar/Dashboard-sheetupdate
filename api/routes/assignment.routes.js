import { Router } from "express";
import {
  getAssetAssignment,
  getAssetHistory,
  assignAssetHandler,
  returnAssetHandler,
} from "../controllers/assignment.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:id/assignment", protect, getAssetAssignment);
router.get("/:id/history", protect, getAssetHistory);
router.post("/:id/assign", protect, restrictTo("admin"), assignAssetHandler);
router.post("/:id/return", protect, restrictTo("admin"), returnAssetHandler);

export default router;
