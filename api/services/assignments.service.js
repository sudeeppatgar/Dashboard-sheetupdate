import { ApiError } from "../utils/ApiError.js";
import Asset from "../models/asset.model.js";
import Employee from "../models/employee.model.js";
import AssetAssignment from "../models/asset-assignment.model.js";

export const getAssignment = async (assetId) => {
  return AssetAssignment.findOne({ assetId, returnedAt: { $exists: false } }).populate("employeeId");
};

export const getHistory = async (assetId) => {
  return AssetAssignment.find({ assetId }).populate("employeeId").sort({ assignedAt: -1 });
};

export const assignAsset = async (assetId, data, userId) => {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, "Asset not found");
  if (asset.status === "retired") throw new ApiError(400, "Asset cannot be assigned because it is retired");
  const active = await AssetAssignment.findOne({ assetId, returnedAt: { $exists: false } });
  if (active) throw new ApiError(400, "Asset is already assigned");
  const employee = await Employee.findById(data.employeeId);
  if (!employee) throw new ApiError(404, "Employee not found");
  if (!employee.isActive) throw new ApiError(400, "Employee is inactive");
  const assignment = await AssetAssignment.create({
    assetId,
    employeeId: data.employeeId,
    assignedBy: userId,
    assignedAt: data.assignedAt ? new Date(data.assignedAt) : new Date(),
    notes: data.notes,
  });
  asset.assignedEmployeeId = data.employeeId;
  asset.status = "assigned";
  await asset.save();
  return assignment;
};

export const returnAsset = async (assetId, data, userId) => {
  const asset = await Asset.findById(assetId);
  if (!asset) throw new ApiError(404, "Asset not found");
  const assignment = await AssetAssignment.findOne({ assetId, returnedAt: { $exists: false } });
  if (!assignment) throw new ApiError(400, "Asset has no active assignment");
  if (data.returnedAt) {
    const rd = new Date(data.returnedAt);
    if (rd < new Date(assignment.assignedAt)) throw new ApiError(400, "Return date cannot be before assignment date");
    assignment.returnedAt = rd;
  } else {
    assignment.returnedAt = new Date();
  }
  assignment.returnedBy = userId;
  assignment.returnCondition = data.returnCondition;
  assignment.returnNotes = data.returnNotes;
  await assignment.save();
  asset.assignedEmployeeId = undefined;
  asset.status = data.returnCondition === "damaged" || data.returnCondition === "under_repair" ? "maintenance" : "available";
  if (data.returnCondition) asset.condition = data.returnCondition;
  await asset.save();
  return assignment;
};
