import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAuditLogs } from "../services/audit-logs.service.js";

export const getAuditLogsHandler = asyncHandler(async (req, res) => {
  const result = await getAuditLogs(req.query);
  res.json(new ApiResponse(200, result, "Audit logs fetched"));
});
