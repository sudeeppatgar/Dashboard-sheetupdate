import { ApiError } from "../utils/ApiError.js";
import Asset, { ASSET_STATUSES, ASSET_CONDITIONS } from "../models/asset.model.js";

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

export const createAsset = async (data) => {
  if (data.warrantyStartDate && data.warrantyEndDate && new Date(data.warrantyEndDate) < new Date(data.warrantyStartDate)) {
    throw new ApiError(400, "Warranty end date cannot be before start date");
  }
  return Asset.create(data);
};

export const getAssets = async (query = {}) => {
  const filter = buildAssetFilter(query);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25));
  const skip = (page - 1) * limit;
  const [items, totalItems] = await Promise.all([
    Asset.find(filter)
      .populate("categoryId")
      .populate("makeModelId")
      .populate("processorId")
      .populate("assignedEmployeeId")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Asset.countDocuments(filter),
  ]);
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit) || 1,
      hasNextPage: page * limit < totalItems,
      hasPreviousPage: page > 1,
    },
  };
};

export const getAssetById = async (id) => {
  const asset = await Asset.findById(id)
    .populate("categoryId")
    .populate("makeModelId")
    .populate("processorId")
    .populate("createdBy", "name email");

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return asset;
};

export const updateAsset = async (id, data) => {
  if (data.warrantyStartDate && data.warrantyEndDate && new Date(data.warrantyEndDate) < new Date(data.warrantyStartDate)) {
    throw new ApiError(400, "Warranty end date cannot be before start date");
  }
  const asset = await Asset.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return asset;
};

export const exportAssetsCsv = async (query = {}) => {
  const filter = buildAssetFilter(query);
  const assets = await Asset.find(filter)
    .populate("categoryId")
    .populate("makeModelId")
    .populate("processorId")
    .populate("assignedEmployeeId")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
  const header = ["Name","Serial Number","Status","Condition","Location","Category","Make/Model","Processor","Employee","Added By","Purchase Date","Warranty Start","Warranty End"];
  const rows = assets.map((a) => [
    a.fullName,
    a.serialNumber || "",
    a.status,
    a.condition || "",
    a.location || "",
    a.categoryId?.name || "",
    a.makeModelId?.name || "",
    a.processorId?.name || "",
    a.assignedEmployeeId?.name || "",
    a.createdBy?.name || "",
    a.transactionDate ? new Date(a.transactionDate).toISOString().slice(0,10) : "",
    a.warrantyStartDate ? new Date(a.warrantyStartDate).toISOString().slice(0,10) : "",
    a.warrantyEndDate ? new Date(a.warrantyEndDate).toISOString().slice(0,10) : "",
  ]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
};

export const deleteAsset = async (id) => {
  const asset = await Asset.findByIdAndDelete(id);

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return asset;
};
