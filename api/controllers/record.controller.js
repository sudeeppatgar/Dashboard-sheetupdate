import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createRecord as createRecordEntry,
  getRecords as getRecordEntries,
  updateRecord as updateRecordEntry,
  deleteRecord as deleteRecordEntry,
  exportRecordsCsv,
} from "../services/records.service.js";
import {
  getHistory,
  assignRecord,
  returnRecord,
} from "../services/record-assignments.service.js";

export const createRecord = asyncHandler(async (req, res) => {
  const record = await createRecordEntry(req.body, req.user?._id, req.workspaceOwnerId);
  res.status(201).json(new ApiResponse(201, record, "Record created"));
});

export const getRecords = asyncHandler(async (req, res) => {
  const records = await getRecordEntries(req.query, req.workspaceOwnerId);
  res.json(new ApiResponse(200, records, "Records fetched"));
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await updateRecordEntry(req.params.id, req.body, req.workspaceOwnerId);
  res.json(new ApiResponse(200, record, "Record updated"));
});

export const deleteRecord = asyncHandler(async (req, res) => {
  await deleteRecordEntry(req.params.id, req.workspaceOwnerId);
  res.json(new ApiResponse(200, null, "Record deleted"));
});

export const exportRecords = asyncHandler(async (req, res) => {
  const csv = await exportRecordsCsv(req.query, req.workspaceOwnerId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="records.csv"');
  res.send(csv);
});

export const getRecordHistory = asyncHandler(async (req, res) => {
  const history = await getHistory(req.params.id, req.workspaceOwnerId);
  res.json(new ApiResponse(200, history, "History fetched"));
});

export const assignRecordHandler = asyncHandler(async (req, res) => {
  const assignment = await assignRecord(req.params.id, req.body, req.user._id, req.workspaceOwnerId, req.workspaceId);
  res.status(201).json(new ApiResponse(201, assignment, "Record assigned"));
});

export const returnRecordHandler = asyncHandler(async (req, res) => {
  const assignment = await returnRecord(req.params.id, req.body, req.user._id, req.workspaceOwnerId);
  res.json(new ApiResponse(200, assignment, "Record returned"));
});
