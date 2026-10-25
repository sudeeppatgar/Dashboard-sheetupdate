import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createRecord as createRecordEntry,
  getRecords as getRecordEntries,
  getRecordById,
  updateRecord as updateRecordEntry,
  deleteRecord as deleteRecordEntry,
  exportRecordsCsv,
} from "../services/records.service.js";
import {
  getAssignment,
  getHistory,
  assignRecord,
  returnRecord,
} from "../services/record-assignments.service.js";

export const createRecord = asyncHandler(async (req, res) => {
  const record = await createRecordEntry(req.body, req.user?._id);
  res.status(201).json(new ApiResponse(201, record, "Record created"));
});

export const getRecords = asyncHandler(async (req, res) => {
  const records = await getRecordEntries(req.query);
  res.json(new ApiResponse(200, records, "Records fetched"));
});

export const getRecord = asyncHandler(async (req, res) => {
  const record = await getRecordById(req.params.id);
  res.json(new ApiResponse(200, record, "Record fetched"));
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await updateRecordEntry(req.params.id, req.body);
  res.json(new ApiResponse(200, record, "Record updated"));
});

export const deleteRecord = asyncHandler(async (req, res) => {
  await deleteRecordEntry(req.params.id);
  res.json(new ApiResponse(200, null, "Record deleted"));
});

export const exportRecords = asyncHandler(async (req, res) => {
  const csv = await exportRecordsCsv(req.query);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="records.csv"');
  res.send(csv);
});

export const getRecordAssignment = asyncHandler(async (req, res) => {
  const assignment = await getAssignment(req.params.id);
  res.json(new ApiResponse(200, assignment, "Assignment fetched"));
});

export const getRecordHistory = asyncHandler(async (req, res) => {
  const history = await getHistory(req.params.id);
  res.json(new ApiResponse(200, history, "History fetched"));
});

export const assignRecordHandler = asyncHandler(async (req, res) => {
  const assignment = await assignRecord(req.params.id, req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, assignment, "Record assigned"));
});

export const returnRecordHandler = asyncHandler(async (req, res) => {
  const assignment = await returnRecord(req.params.id, req.body, req.user._id);
  res.json(new ApiResponse(200, assignment, "Record returned"));
});
