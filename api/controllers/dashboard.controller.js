import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getSummary } from "../services/dashboard.service.js";

export const summary = asyncHandler(async (req, res) =>
  res.json(new ApiResponse(200, await getSummary(req.query, req.workspaceOwnerId), "Summary fetched")));
