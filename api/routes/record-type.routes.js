import { Router } from "express";
import {
  createRecordType,
  getRecordTypes,
  getRecordType,
  updateRecordType,
  toggleRecordTypeStatus,
  deleteRecordType,
} from "../controllers/record-type.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createRecordTypeValidator,
  updateRecordTypeValidator,
  recordTypeIdValidator,
} from "../validators/generic.validator.js";

const router = Router();

router.use(protect);
router.get("/", getRecordTypes);
router.get("/:id", validateParams(recordTypeIdValidator), getRecordType);
router.post("/", restrictTo("admin"), validateBody(createRecordTypeValidator), createRecordType);
router.put("/:id", restrictTo("admin"), validateParams(recordTypeIdValidator), validateBody(updateRecordTypeValidator), updateRecordType);
router.patch("/:id/status", restrictTo("admin"), validateParams(recordTypeIdValidator), toggleRecordTypeStatus);
router.delete("/:id", restrictTo("admin"), validateParams(recordTypeIdValidator), deleteRecordType);

export default router;
