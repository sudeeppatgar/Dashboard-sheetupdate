import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createMakeModel as createMakeModelRecord,
  getMakeModels as getMakeModelRecords,
  getMakeModelById,
  updateMakeModel as updateMakeModelRecord,
  deleteMakeModel as deleteMakeModelRecord,
} from "../services/make-models.service.js";

export const createMakeModel = asyncHandler(async (req, res) => {
  const item = await createMakeModelRecord(req.body);

  res.status(201).json(new ApiResponse(201, item, "Make model created"));
});

export const getMakeModels = asyncHandler(async (req, res) => {
  const items = await getMakeModelRecords();

  res.json(new ApiResponse(200, items, "Make models fetched"));
});

export const getMakeModel = asyncHandler(async (req, res) => {
  const item = await getMakeModelById(req.params.id);

  res.json(new ApiResponse(200, item, "Make model fetched"));
});

export const updateMakeModel = asyncHandler(async (req, res) => {
  const item = await updateMakeModelRecord(req.params.id, req.body);

  res.json(new ApiResponse(200, item, "Make model updated"));
});

export const deleteMakeModel = asyncHandler(async (req, res) => {
  await deleteMakeModelRecord(req.params.id);

  res.json(new ApiResponse(200, null, "Make model deleted"));
});
