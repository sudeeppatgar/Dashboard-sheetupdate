import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getAssignment,
  getHistory,
  assignAsset,
  returnAsset,
} from "../services/assignments.service.js";

export const getAssetAssignment = asyncHandler(async (req, res) => {
  const assignment = await getAssignment(req.params.id);
  res.json(new ApiResponse(200, assignment, "Assignment fetched"));
});

export const getAssetHistory = asyncHandler(async (req, res) => {
  const history = await getHistory(req.params.id);
  res.json(new ApiResponse(200, history, "History fetched"));
});

export const assignAssetHandler = asyncHandler(async (req, res) => {
  const assignment = await assignAsset(req.params.id, req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, assignment, "Asset assigned"));
});

export const returnAssetHandler = asyncHandler(async (req, res) => {
  const assignment = await returnAsset(req.params.id, req.body, req.user._id);
  res.json(new ApiResponse(200, assignment, "Asset returned"));
});
