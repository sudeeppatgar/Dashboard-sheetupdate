import { ApiError } from "../utils/ApiError.js";
import Processor from "../models/processor.model.js";
import Asset from "../models/asset.model.js";

export const createProcessor = (data) => Processor.create(data);

export const getProcessors = () => Processor.find().sort({ createdAt: -1 });

export const getProcessorById = async (id) => {
  const processor = await Processor.findById(id);

  if (!processor) {
    throw new ApiError(404, "Processor not found");
  }

  return processor;
};

export const updateProcessor = async (id, data) => {
  const processor = await Processor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!processor) {
    throw new ApiError(404, "Processor not found");
  }

  return processor;
};

export const deleteProcessor = async (id) => {
  const processor = await Processor.findById(id);

  if (!processor) {
    throw new ApiError(404, "Processor not found");
  }

  const isReferenced = await Asset.exists({ processorId: id });

  if (isReferenced) {
    throw new ApiError(
      409,
      "Cannot delete processor because it is referenced by one or more assets",
    );
  }

  await Processor.findByIdAndDelete(id);

  return processor;
};
