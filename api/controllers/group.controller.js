import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createGroup as createGroupRecord,
  getGroups as getGroupRecords,
  updateGroup as updateGroupRecord,
  toggleGroupStatus as toggleGroupRecordStatus,
  deleteGroup as deleteGroupRecord,
} from "../services/groups.service.js";

export const createGroup = asyncHandler(async (req, res) => {
  const group = await createGroupRecord(req.body);
  res.status(201).json(new ApiResponse(201, group, "Group created"));
});

export const getGroups = asyncHandler(async (req, res) => {
  const groups = await getGroupRecords(req.query);
  res.json(new ApiResponse(200, groups, "Groups fetched"));
});

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await updateGroupRecord(req.params.id, req.body);
  res.json(new ApiResponse(200, group, "Group updated"));
});

export const toggleGroupStatus = asyncHandler(async (req, res) => {
  const group = await toggleGroupRecordStatus(req.params.id, req.body.isActive);
  res.json(new ApiResponse(200, group, "Group status updated"));
});

export const deleteGroup = asyncHandler(async (req, res) => {
  await deleteGroupRecord(req.params.id);
  res.json(new ApiResponse(200, null, "Group deleted"));
});
