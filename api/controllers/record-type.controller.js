import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createRecordType as createRecordTypeRecord,
  getRecordTypes as getRecordTypeRecords,
  updateRecordType as updateRecordTypeRecord,
  toggleRecordTypeStatus as toggleRecordTypeRecordStatus,
  deleteRecordType as deleteRecordTypeRecord,
} from "../services/record-types.service.js";

export const createRecordType = asyncHandler(async (req, res) => {
  const recordType = await createRecordTypeRecord(req.body);
  res.status(201).json(new ApiResponse(201, recordType, "Record type created"));
});

export const getRecordTypes = asyncHandler(async (req, res) => {
  const recordTypes = await getRecordTypeRecords(req.query);
  res.json(new ApiResponse(200, recordTypes, "Record types fetched"));
});

export const updateRecordType = asyncHandler(async (req, res) => {
  const recordType = await updateRecordTypeRecord(req.params.id, req.body);
  res.json(new ApiResponse(200, recordType, "Record type updated"));
});

export const toggleRecordTypeStatus = asyncHandler(async (req, res) => {
  const recordType = await toggleRecordTypeRecordStatus(req.params.id, req.body.isActive);
  res.json(new ApiResponse(200, recordType, "Record type status updated"));
});

export const deleteRecordType = asyncHandler(async (req, res) => {
  await deleteRecordTypeRecord(req.params.id);
  res.json(new ApiResponse(200, null, "Record type deleted"));
});
