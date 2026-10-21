import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getSummary,
  getAssetsByStatus,
  getAssetsByCategory,
  getAssetsByDepartment,
  getWarrantyExpiring,
} from "../services/dashboard.service.js";

export const summary = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await getSummary(), "Summary fetched")));
export const byStatus = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await getAssetsByStatus(), "By status fetched")));
export const byCategory = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await getAssetsByCategory(), "By category fetched")));
export const byDepartment = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await getAssetsByDepartment(), "By department fetched")));
export const warrantyExpiring = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await getWarrantyExpiring(req.query.days), "Warranty expiring fetched")));
