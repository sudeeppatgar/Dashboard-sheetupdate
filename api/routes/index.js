import { Router } from "express";
import employees from "./employee.routes.js";
import departments from "./department.routes.js";
import categories from "./category.routes.js";
import assignments from "./assignment.routes.js";
import dashboard from "./dashboard.routes.js";
import auditLogs from "./audit-log.routes.js";
import assets from "./asset.routes.js";
import makeModels from "./makeModel.routes.js";
import processors from "./processor.routes.js";
import auth from "./auth.routes.js";

const router = Router();

router.use("/employees", employees);
router.use("/departments", departments);
router.use("/categories", categories);
router.use("/assets", assignments);
router.use("/dashboard", dashboard);
router.use("/audit-logs", auditLogs);
router.use("/assets", assets);
router.use("/make-models", makeModels);
router.use("/processors", processors);
router.use("/auth", auth);

export default router;
