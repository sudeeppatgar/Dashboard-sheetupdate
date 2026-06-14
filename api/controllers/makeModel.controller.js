import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import MakeModel from "../models/makeModel.model.js";

export const createMakeModel = asyncHandler(async (req, res) => {
  const item = await MakeModel.create(req.body);

  res.status(201).json(new ApiResponse(201, item, "Make model created"));
});

export const getMakeModels = asyncHandler(async (req, res) => {
  const items = await MakeModel.find().sort({ createdAt: -1 });

  res.json(new ApiResponse(200, items, "Make models fetched"));
});

export const getMakeModel = asyncHandler(async (req, res) => {
  const item = await MakeModel.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, "Make model not found");
  }

  res.json(new ApiResponse(200, item, "Make model fetched"));
});

export const updateMakeModel = asyncHandler(async (req, res) => {
  const item = await MakeModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new ApiError(404, "Make model not found");
  }

  res.json(new ApiResponse(200, item, "Make model updated"));
});

export const deleteMakeModel = asyncHandler(async (req, res) => {
  const item = await MakeModel.findByIdAndDelete(req.params.id);

  if (!item) {
    throw new ApiError(404, "Make model not found");
  }

  res.json(new ApiResponse(200, null, "Make model deleted"));
});
