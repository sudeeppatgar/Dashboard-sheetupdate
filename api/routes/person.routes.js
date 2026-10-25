import { Router } from "express";
import {
  createPerson,
  getPeople,
  updatePerson,
  togglePersonStatus,
  deletePerson,
} from "../controllers/person.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../middleware/validator.middleware.js";
import {
  createPersonValidator,
  updatePersonValidator,
  personIdValidator,
} from "../validators/generic.validator.js";

const router = Router();

router.use(protect);
router.get("/", getPeople);
router.post("/", restrictTo("admin"), validateBody(createPersonValidator), createPerson);
router.put("/:id", restrictTo("admin"), validateParams(personIdValidator), validateBody(updatePersonValidator), updatePerson);
router.patch("/:id/status", restrictTo("admin"), validateParams(personIdValidator), togglePersonStatus);
router.delete("/:id", restrictTo("admin"), validateParams(personIdValidator), deletePerson);

export default router;
