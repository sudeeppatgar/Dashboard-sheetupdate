import { Router } from "express";

import {
  createProcessor,
  getProcessors,
  getProcessor,
  updateProcessor,
  deleteProcessor,
} from "../controllers/processor.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createProcessorValidator,
  processorIdValidator,
  updateProcessorValidator,
} from "../validators/processor.validator.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo("admin"), validateBody(createProcessorValidator), createProcessor);
router.get("/", getProcessors);
router.get("/:id", validateParams(processorIdValidator), getProcessor);
router.put("/:id", restrictTo("admin"), validateParams(processorIdValidator), validateBody(updateProcessorValidator), updateProcessor);
router.delete("/:id", restrictTo("admin"), validateParams(processorIdValidator), deleteProcessor);
export default router;
