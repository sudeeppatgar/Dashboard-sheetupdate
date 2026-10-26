import { ApiError } from "../utils/ApiError.js";
import RecordType, { DEFAULT_RECORD_STATUSES } from "../models/record-type.model.js";
import Record from "../models/record.model.js";
import { escapeRegex, slugify } from "../utils/domain.js";

const normalizeStatuses = (statuses) => {
  if (statuses === undefined) return DEFAULT_RECORD_STATUSES;
  if (!Array.isArray(statuses) || statuses.length === 0) {
    throw new ApiError(400, "statuses must be a non-empty array");
  }

  const normalized = statuses.map((status) => ({
    key: slugify(status.key),
    label: String(status.label || status.key || "").trim(),
    terminal: Boolean(status.terminal),
  }));
  const keys = normalized.map((status) => status.key);

  if (normalized.some((status) => !status.key || !status.label)) {
    throw new ApiError(400, "Each status requires a key and label");
  }

  if (new Set(keys).size !== keys.length) {
    throw new ApiError(400, "Record status keys must be unique");
  }

  return normalized;
};

const normalizeFields = (fields) => {
  if (fields === undefined) return [];
  if (!Array.isArray(fields)) throw new ApiError(400, "fields must be an array");

  const normalized = fields.map((field) => ({
    key: slugify(field.key),
    label: String(field.label || field.key || "").trim(),
    type: field.type || "text",
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options.map((option) => String(option)) : undefined,
  }));
  const keys = normalized.map((field) => field.key);
  const validTypes = new Set(["text", "multiline", "number", "date", "boolean", "select"]);

  if (normalized.some((field) => !field.key || !field.label)) {
    throw new ApiError(400, "Each custom field requires a key and label");
  }

  if (normalized.some((field) => !validTypes.has(field.type))) {
    throw new ApiError(400, "Custom field type is not supported");
  }

  if (normalized.some((field) => field.type === "select" && (!field.options || field.options.length === 0))) {
    throw new ApiError(400, "Select custom fields require options");
  }

  if (new Set(keys).size !== keys.length) {
    throw new ApiError(400, "Custom field keys must be unique");
  }

  return normalized;
};

const normalizeRecordType = (data = {}) => {
  const safeData = { ...data };
  delete safeData.workspaceOwnerId;
  const statuses = normalizeStatuses(data.statuses);
  const fields = normalizeFields(data.fields);
  const assignment = {
    enabled: data.assignment?.enabled === true,
    assignedStatus: slugify(data.assignment?.assignedStatus || "assigned"),
    availableStatus: slugify(data.assignment?.availableStatus || "available"),
  };

  if (assignment.enabled) {
    const statusKeys = new Set(statuses.map((status) => status.key));
    if (!statusKeys.has(assignment.assignedStatus) || !statusKeys.has(assignment.availableStatus)) {
      throw new ApiError(400, "Assignment statuses must exist in the record type statuses");
    }
  }

  return {
    ...safeData,
    key: slugify(safeData.key || safeData.name),
    name: String(safeData.name || "").trim(),
    pluralName: safeData.pluralName ? String(safeData.pluralName).trim() : undefined,
    description: safeData.description ? String(safeData.description).trim() : undefined,
    statuses,
    fields,
    assignment,
  };
};

export const createRecordType = async (data, workspaceOwnerId) => {
  const normalized = normalizeRecordType(data);
  if (!normalized.name) throw new ApiError(400, "name is required");
  return RecordType.create({ ...normalized, workspaceOwnerId });
};

export const getRecordTypes = async (filters = {}, workspaceOwnerId) => {
  const query = { workspaceOwnerId };
  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), "i");
    query.$or = [{ name: regex }, { key: regex }];
  }
  if (typeof filters.isActive !== "undefined" && filters.isActive !== "") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  return RecordType.find(query).sort({ name: 1 });
};

export const getRecordTypeById = async (id, workspaceOwnerId) => {
  const recordType = await RecordType.findOne({ _id: id, workspaceOwnerId });
  if (!recordType) throw new ApiError(404, "Record type not found");
  return recordType;
};

export const updateRecordType = async (id, data, workspaceOwnerId) => {
  const current = await getRecordTypeById(id, workspaceOwnerId);
  const currentData = current.toObject();
  const normalized = normalizeRecordType({
    key: currentData.key,
    name: currentData.name,
    pluralName: currentData.pluralName,
    description: currentData.description,
    statuses: currentData.statuses,
    fields: currentData.fields,
    assignment: currentData.assignment,
    isActive: currentData.isActive,
    ...data,
  });
  const recordType = await RecordType.findOneAndUpdate({ _id: id, workspaceOwnerId }, normalized, {
    new: true,
    runValidators: true,
  });
  return recordType;
};

export const toggleRecordTypeStatus = async (id, isActive, workspaceOwnerId) => {
  const recordType = await RecordType.findOneAndUpdate(
    { _id: id, workspaceOwnerId },
    { isActive: Boolean(isActive) },
    { new: true, runValidators: true },
  );
  if (!recordType) throw new ApiError(404, "Record type not found");
  return recordType;
};

export const deleteRecordType = async (id, workspaceOwnerId) => {
  const recordType = await getRecordTypeById(id, workspaceOwnerId);
  if (await Record.exists({ recordTypeId: id, workspaceOwnerId })) {
    throw new ApiError(409, "Cannot delete a record type that is in use");
  }
  await RecordType.deleteOne({ _id: id, workspaceOwnerId });
  return recordType;
};
