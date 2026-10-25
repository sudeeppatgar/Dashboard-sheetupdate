import { Router } from "express";
import categories from "./category.routes.js";
import users from "./user.routes.js";
import dashboard from "./dashboard.routes.js";
import auditLogs from "./audit-log.routes.js";
import auth from "./auth.routes.js";
import recordTypes from "./record-type.routes.js";
import records from "./record.routes.js";
import groups from "./group.routes.js";
import people from "./person.routes.js";

const router = Router();

router.use("/categories", categories);
router.use("/users", users);
router.use("/dashboard", dashboard);
router.use("/audit-logs", auditLogs);
router.use("/auth", auth);
router.use("/record-types", recordTypes);
router.use("/records", records);
router.use("/groups", groups);
router.use("/people", people);

export default router;
