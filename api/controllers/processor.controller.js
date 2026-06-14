import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Processor from "../models/processor.model.js";

export const createProcessor = asyncHandler(async (req, res) => {
  const processor = await Processor.create(req.body);

  res.status(201).json(new ApiResponse(201, processor, "Processor created"));
});

export const getProcessors = asyncHandler(async (req, res) => {
  const processors = await Processor.find().sort({ createdAt: -1 });

  res.json(new ApiResponse(200, processors, "Processors fetched"));
});

export const getProcessor = asyncHandler(async (req, res) => {
  const processor = await Processor.findById(req.params.id);

  if (!processor) {
    throw new ApiError(404, "Processor not found");
  }

  res.json(new ApiResponse(200, processor, "Processor fetched"));
});

export const updateProcessor = asyncHandler(async (req, res) => {
  const processor = await Processor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!processor) {
    throw new ApiError(404, "Processor not found");
  }

  res.json(new ApiResponse(200, processor, "Processor updated"));
});

export const deleteProcessor = asyncHandler(async (req, res) => {
  const processor = await Processor.findByIdAndDelete(req.params.id);

  if (!processor) {
    throw new ApiError(404, "Processor not found");
  }

  res.json(new ApiResponse(200, null, "Processor deleted"));
});
