import { ApiError } from "../utils/ApiError.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import RecordAssignment from "../models/record-assignment.model.js";
import RecordType from "../models/record-type.model.js";

const loadRecordContext = async (recordId, workspaceOwnerId) => {
  const record = await Record.findOne({ _id: recordId, workspaceOwnerId });
  if (!record) throw new ApiError(404, "Record not found");
  const recordType = await RecordType.findOne({ _id: record.recordTypeId, workspaceOwnerId });
  if (!recordType?.assignment?.enabled) {
    throw new ApiError(400, "Assignments are disabled for this record type");
  }
  return { record, recordType };
};

export const getHistory = async (recordId, workspaceOwnerId) =>
  RecordAssignment.find({ recordId, workspaceOwnerId })
    .populate("personId")
    .populate("assignedBy", "name email")
    .populate("returnedBy", "name email")
    .sort({ assignedAt: -1 });

export const assignRecord = async (recordId, data, userId, workspaceOwnerId) => {
  const { record, recordType } = await loadRecordContext(recordId, workspaceOwnerId);
  const person = await Person.findOne({ _id: data.personId, workspaceOwnerId });
  if (!person) throw new ApiError(404, "Person not found");
  if (!person.isActive) throw new ApiError(400, "Person is inactive");

  const active = await RecordAssignment.findOne({ recordId, workspaceOwnerId, returnedAt: { $exists: false } });
  if (active) throw new ApiError(400, "Record is already assigned");
  if (data.assignedAt && Number.isNaN(new Date(data.assignedAt).getTime())) {
    throw new ApiError(400, "assignedAt must be a valid date");
  }

  const assignment = await RecordAssignment.create({
    recordId,
    personId: data.personId,
    assignedBy: userId,
    assignedAt: data.assignedAt ? new Date(data.assignedAt) : new Date(),
    notes: data.notes,
    metadata: data.metadata,
    workspaceOwnerId,
  });
  record.personId = data.personId;
  record.status = recordType.assignment.assignedStatus;
  await record.save();
  return assignment;
};

export const returnRecord = async (recordId, data, userId, workspaceOwnerId) => {
  const { record, recordType } = await loadRecordContext(recordId, workspaceOwnerId);
  const assignment = await RecordAssignment.findOne({ recordId, workspaceOwnerId, returnedAt: { $exists: false } });
  if (!assignment) throw new ApiError(400, "Record has no active assignment");

  const returnedAt = data.returnedAt ? new Date(data.returnedAt) : new Date();
  if (Number.isNaN(returnedAt.getTime())) throw new ApiError(400, "returnedAt must be a valid date");
  if (returnedAt < new Date(assignment.assignedAt)) {
    throw new ApiError(400, "Return date cannot be before assignment date");
  }

  assignment.returnedAt = returnedAt;
  assignment.returnedBy = userId;
  assignment.returnNotes = data.returnNotes;
  await assignment.save();
  record.personId = undefined;
  record.status = recordType.assignment.availableStatus;
  await record.save();
  return assignment;
};
