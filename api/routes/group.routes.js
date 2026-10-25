import { Router } from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  toggleGroupStatus,
  deleteGroup,
} from "../controllers/group.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createGroupValidator,
  updateGroupValidator,
  groupIdValidator,
} from "../validators/generic.validator.js";

const router = Router();

router.use(protect);
router.get("/", getGroups);
router.get("/:id", validateParams(groupIdValidator), getGroup);
router.post("/", restrictTo("admin"), validateBody(createGroupValidator), createGroup);
router.put("/:id", restrictTo("admin"), validateParams(groupIdValidator), validateBody(updateGroupValidator), updateGroup);
router.patch("/:id/status", restrictTo("admin"), validateParams(groupIdValidator), toggleGroupStatus);
router.delete("/:id", restrictTo("admin"), validateParams(groupIdValidator), deleteGroup);

export default router;
