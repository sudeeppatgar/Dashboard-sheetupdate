import { Router } from "express";
import {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  exportRecords,
  getRecordAssignment,
  getRecordHistory,
  assignRecordHandler,
  returnRecordHandler,
} from "../controllers/record.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateParams } from "../middleware/validator.middleware.js";
import { recordIdValidator } from "../validators/generic.validator.js";

const router = Router();

router.use(protect);
router.get("/export.csv", exportRecords);
router.get("/", getRecords);
router.post("/", restrictTo("admin"), createRecord);
router.get("/:id", validateParams(recordIdValidator), getRecord);
router.put("/:id", restrictTo("admin"), validateParams(recordIdValidator), updateRecord);
router.delete("/:id", restrictTo("admin"), validateParams(recordIdValidator), deleteRecord);
router.get("/:id/assignment", validateParams(recordIdValidator), getRecordAssignment);
router.get("/:id/history", validateParams(recordIdValidator), getRecordHistory);
router.post("/:id/assign", restrictTo("admin"), validateParams(recordIdValidator), assignRecordHandler);
router.post("/:id/return", restrictTo("admin"), validateParams(recordIdValidator), returnRecordHandler);

export default router;
