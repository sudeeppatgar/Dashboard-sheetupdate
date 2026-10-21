import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createAsset as createAssetRecord,
  getAssets as getAssetRecords,
  getAssetById,
  updateAsset as updateAssetRecord,
  deleteAsset as deleteAssetRecord,
  exportAssetsCsv,
} from "../services/assets.service.js";

export const createAsset = asyncHandler(async (req, res) => {
  const asset = await createAssetRecord({ ...req.body, createdBy: req.user?._id });

  res.status(201).json(new ApiResponse(201, asset, "Asset created"));
});

export const getAssets = asyncHandler(async (req, res) => {
  const result = await getAssetRecords(req.query);

  res.json(new ApiResponse(200, result, "Assets fetched"));
});

export const getAsset = asyncHandler(async (req, res) => {
  const asset = await getAssetById(req.params.id);

  res.json(new ApiResponse(200, asset, "Asset fetched"));
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await updateAssetRecord(req.params.id, req.body);

  res.json(new ApiResponse(200, asset, "Asset updated"));
});

export const deleteAsset = asyncHandler(async (req, res) => {
  await deleteAssetRecord(req.params.id);

  res.json(new ApiResponse(200, null, "Asset deleted"));
});

export const exportAssets = asyncHandler(async (req, res) => {
  const csv = await exportAssetsCsv(req.query);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="assets.csv"');
  res.send(csv);
});
