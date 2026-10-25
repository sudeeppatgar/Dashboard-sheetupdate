import { ApiError } from "../utils/ApiError.js";
import Category from "../models/category.model.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import RecordAssignment from "../models/record-assignment.model.js";
import RecordType from "../models/record-type.model.js";
import { escapeRegex, hasValue, isPlainObject } from "../utils/domain.js";

const getType = async (recordTypeId) => {
  if (!recordTypeId) throw new ApiError(400, "recordTypeId is required");
  const recordType = await RecordType.findById(recordTypeId);
  if (!recordType) throw new ApiError(400, "Record type not found");
  if (!recordType.isActive) throw new ApiError(400, "Record type is inactive");
  return recordType;
};

const getStatusKeys = (recordType) => recordType.statuses.map((status) => status.key);

const validateCustomFields = (recordType, customFields = {}) => {
  if (!isPlainObject(customFields)) {
    throw new ApiError(400, "customFields must be an object");
  }

  const definitions = new Map(recordType.fields.map((field) => [field.key, field]));
  const errors = [];

  for (const field of recordType.fields) {
    const value = customFields[field.key];
    const present = hasValue(value);

    if (field.required && !present) {
      errors.push({ field: `customFields.${field.key}`, message: `${field.label} is required` });
      continue;
    }
    if (!present) continue;

    if (["text", "multiline"].includes(field.type) && typeof value !== "string") {
      errors.push({ field: `customFields.${field.key}`, message: `${field.label} must be text` });
    }
    if (field.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) {
      errors.push({ field: `customFields.${field.key}`, message: `${field.label} must be a number` });
    }
    if (field.type === "boolean" && typeof value !== "boolean") {
      errors.push({ field: `customFields.${field.key}`, message: `${field.label} must be true or false` });
    }
    if (field.type === "date" && (typeof value !== "string" || Number.isNaN(Date.parse(value)))) {
      errors.push({ field: `customFields.${field.key}`, message: `${field.label} must be a valid date` });
    }
    if (field.type === "select" && !field.options.includes(String(value))) {
      errors.push({ field: `customFields.${field.key}`, message: `${field.label} has an invalid option` });
    }
  }

  for (const key of Object.keys(customFields)) {
    if (!definitions.has(key)) {
      errors.push({ field: `customFields.${key}`, message: "Field is not defined for this record type" });
    }
  }

  if (errors.length > 0) throw new ApiError(400, "Custom field validation failed", errors);
};

const validateReferences = async ({ categoryId, groupId, personId }) => {
  const [category, group, person] = await Promise.all([
    categoryId ? Category.findById(categoryId) : null,
    groupId ? Group.findById(groupId) : null,
    personId ? Person.findById(personId) : null,
  ]);

  if (categoryId && !category) throw new ApiError(400, "Category not found");
  if (groupId && !group) throw new ApiError(400, "Group not found");
  if (personId && !person) throw new ApiError(400, "Person not found");
  if (person && !person.isActive) throw new ApiError(400, "Person is inactive");
};

const normalizePayload = (data = {}) => ({
  name: data.name,
  reference: data.reference,
  acquiredAt: data.acquiredAt,
  recordTypeId: data.recordTypeId,
  categoryId: data.categoryId,
  groupId: data.groupId,
  personId: data.personId,
  location: data.location,
  status: data.status,
  customFields: data.customFields ?? {},
  metadata: data.metadata ?? {},
});

const prepareRecord = async (data, current = null) => {
  const incoming = normalizePayload(data);
  const recordTypeId = incoming.recordTypeId ?? current?.recordTypeId;
  const recordType = await getType(recordTypeId);
  const customFields = data.customFields === undefined
    ? (current?.customFields instanceof Map ? Object.fromEntries(current.customFields) : current?.customFields || {})
    : incoming.customFields;
  const status = incoming.status ?? current?.status ?? recordType.statuses[0]?.key;
  const effective = {
    ...incoming,
    name: incoming.name ?? current?.name,
    recordTypeId,
    reference: incoming.reference !== undefined ? incoming.reference : current?.reference,
    categoryId: incoming.categoryId !== undefined ? incoming.categoryId : current?.categoryId,
    groupId: incoming.groupId !== undefined ? incoming.groupId : current?.groupId,
    personId: incoming.personId !== undefined ? incoming.personId : current?.personId,
    location: incoming.location !== undefined ? incoming.location : current?.location,
    acquiredAt: incoming.acquiredAt !== undefined ? incoming.acquiredAt : current?.acquiredAt,
    metadata: data.metadata === undefined ? current?.metadata || {} : incoming.metadata,
  };

  if (!effective.name) throw new ApiError(400, "name is required");
  if (!status || !getStatusKeys(recordType).includes(status)) {
    throw new ApiError(400, `status must be one of: ${getStatusKeys(recordType).join(", ")}`);
  }
  if (effective.acquiredAt && Number.isNaN(new Date(effective.acquiredAt).getTime())) {
    throw new ApiError(400, "acquiredAt must be a valid date");
  }

  validateCustomFields(recordType, customFields);
  await validateReferences(effective);

  return {
    recordType,
    data: {
      ...effective,
      name: String(effective.name).trim(),
      status,
      customFields,
    },
  };
};

const buildFilter = (query = {}) => {
  const filter = {};
  if (query.recordTypeId) filter.recordTypeId = query.recordTypeId;
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.groupId) filter.groupId = query.groupId;
  if (query.personId) filter.personId = query.personId;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ name: regex }, { reference: regex }];
  }
  return filter;
};

const populateRecord = (query) =>
  query
    .populate("recordTypeId")
    .populate("categoryId")
    .populate("groupId")
    .populate("personId")
    .populate("createdBy", "name email");

export const createRecord = async (data, userId) => {
  const { data: prepared } = await prepareRecord(data);
  return Record.create({ ...prepared, createdBy: userId });
};

export const getRecords = async (query = {}) => {
  const filter = buildFilter(query);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25));
  const skip = (page - 1) * limit;
  const [items, totalItems] = await Promise.all([
    populateRecord(Record.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Record.countDocuments(filter),
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

export const updateRecord = async (id, data) => {
  const current = await Record.findById(id);
  if (!current) throw new ApiError(404, "Record not found");
  const { data: prepared } = await prepareRecord(data, current);
  const record = await Record.findByIdAndUpdate(id, prepared, {
    new: true,
    runValidators: true,
  });
  return populateRecord(Record.findById(record._id));
};

export const deleteRecord = async (id) => {
  const record = await Record.findById(id);
  if (!record) throw new ApiError(404, "Record not found");
  if (await RecordAssignment.exists({ recordId: id, returnedAt: { $exists: false } })) {
    throw new ApiError(409, "Cannot delete a record with an active assignment");
  }
  await Record.findByIdAndDelete(id);
  return record;
};

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const exportRecordsCsv = async (query = {}) => {
  const records = await populateRecord(Record.find(buildFilter(query)).sort({ createdAt: -1 }));
  const header = ["Name", "Reference", "Type", "Status", "Category", "Group", "Person", "Location", "Acquired At", "Custom Fields"];
  const rows = records.map((record) => [
    record.name,
    record.reference,
    record.recordTypeId?.name,
    record.status,
    record.categoryId?.name,
    record.groupId?.name,
    record.personId?.name,
    record.location,
    record.acquiredAt ? new Date(record.acquiredAt).toISOString().slice(0, 10) : "",
    JSON.stringify(record.customFields instanceof Map ? Object.fromEntries(record.customFields) : record.customFields || {}),
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
};
