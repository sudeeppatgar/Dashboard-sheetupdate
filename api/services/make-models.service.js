import { ApiError } from "../utils/ApiError.js";
import MakeModel from "../models/makeModel.model.js";

export const createMakeModel = (data) => MakeModel.create(data);

export const getMakeModels = () => MakeModel.find().sort({ createdAt: -1 });

export const getMakeModelById = async (id) => {
  const item = await MakeModel.findById(id);

  if (!item) {
    throw new ApiError(404, "Make model not found");
  }

  return item;
};

export const updateMakeModel = async (id, data) => {
  const item = await MakeModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new ApiError(404, "Make model not found");
  }

  return item;
};

export const deleteMakeModel = async (id) => {
  const item = await MakeModel.findByIdAndDelete(id);

  if (!item) {
    throw new ApiError(404, "Make model not found");
  }

  return item;
};
