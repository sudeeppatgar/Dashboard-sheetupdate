import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createProcessor as createProcessorRecord,
  getProcessors as getProcessorRecords,
  getProcessorById,
  updateProcessor as updateProcessorRecord,
  deleteProcessor as deleteProcessorRecord,
} from "../services/processors.service.js";

export const createProcessor = asyncHandler(async (req, res) => {
  const processor = await createProcessorRecord(req.body);

  res.status(201).json(new ApiResponse(201, processor, "Processor created"));
});

export const getProcessors = asyncHandler(async (req, res) => {
  const processors = await getProcessorRecords();

  res.json(new ApiResponse(200, processors, "Processors fetched"));
});

export const getProcessor = asyncHandler(async (req, res) => {
  const processor = await getProcessorById(req.params.id);

  res.json(new ApiResponse(200, processor, "Processor fetched"));
});

export const updateProcessor = asyncHandler(async (req, res) => {
  const processor = await updateProcessorRecord(req.params.id, req.body);

  res.json(new ApiResponse(200, processor, "Processor updated"));
});

export const deleteProcessor = asyncHandler(async (req, res) => {
  await deleteProcessorRecord(req.params.id);

  res.json(new ApiResponse(200, null, "Processor deleted"));
});
