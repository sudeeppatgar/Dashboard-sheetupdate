import { Router } from "express";

import {
  createMakeModel,
  getMakeModels,
  getMakeModel,
  updateMakeModel,
  deleteMakeModel,
} from "../controllers/makeModel.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createMakeModelValidator,
  makeModelIdValidator,
  updateMakeModelValidator,
} from "../validators/makeModel.validator.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo("admin"), validateBody(createMakeModelValidator), createMakeModel);
router.get("/", getMakeModels);
router.get("/:id", validateParams(makeModelIdValidator), getMakeModel);
router.put("/:id", restrictTo("admin"), validateParams(makeModelIdValidator), validateBody(updateMakeModelValidator), updateMakeModel);
router.delete("/:id", restrictTo("admin"), validateParams(makeModelIdValidator), deleteMakeModel);

export default router;
