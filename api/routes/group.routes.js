import { Router } from "express";
import {
  createGroup,
  getGroups,
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
router.post("/", restrictTo("admin"), validateBody(createGroupValidator), createGroup);
router.put("/:id", restrictTo("admin"), validateParams(groupIdValidator), validateBody(updateGroupValidator), updateGroup);
router.patch("/:id/status", restrictTo("admin"), validateParams(groupIdValidator), toggleGroupStatus);
router.delete("/:id", restrictTo("admin"), validateParams(groupIdValidator), deleteGroup);

export default router;
