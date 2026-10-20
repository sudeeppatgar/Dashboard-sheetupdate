import { ApiError } from "../utils/ApiError.js";
import Asset, { ASSET_STATUSES } from "../models/asset.model.js";

const buildAssetFilter = (query = {}) => {
  const filter = {};

  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }

  if (query.makeModelId) {
    filter.makeModelId = query.makeModelId;
  }

  if (query.processorId) {
    filter.processorId = query.processorId;
  }

  if (ASSET_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.search) {
    const search = String(query.search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
      ];
    }
  }

  return filter;
};

export const createAsset = (data) => Asset.create(data);

export const getAssets = (query) =>
  Asset.find(buildAssetFilter(query))
    .populate("categoryId")
    .populate("makeModelId")
    .populate("processorId")
    .sort({ createdAt: -1 });

export const getAssetById = async (id) => {
  const asset = await Asset.findById(id)
    .populate("categoryId")
    .populate("makeModelId")
    .populate("processorId");

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return asset;
};

export const updateAsset = async (id, data) => {
  const asset = await Asset.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return asset;
};

export const deleteAsset = async (id) => {
  const asset = await Asset.findByIdAndDelete(id);

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return asset;
};
