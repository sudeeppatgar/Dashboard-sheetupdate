import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Asset from "../models/asset.model.js";

export const createAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.create(req.body);

  res.status(201).json(new ApiResponse(201, asset, "Asset created"));
});

export const getAssets = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId;
  }

  if (req.query.makeModelId) {
    filter.makeModelId = req.query.makeModelId;
  }

  if (req.query.processorId) {
    filter.processorId = req.query.processorId;
  }

  const assets = await Asset.find(filter)
    .populate("categoryId")
    .populate("makeModelId")
    .populate("processorId")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, assets, "Assets fetched"));
});

export const getAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate("categoryId")
    .populate("makeModelId")
    .populate("processorId");

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  res.json(new ApiResponse(200, asset, "Asset fetched"));
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  res.json(new ApiResponse(200, asset, "Asset updated"));
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  res.json(new ApiResponse(200, null, "Asset deleted"));
});
