import {
  isMongoId,
  isNonEmptyString,
  isValidDate,
  trimValue,
} from "../utils/validators.js";
import { ASSET_STATUSES } from "../models/asset.model.js";

const objectIdValidator = (label) => ({
  required: false,
  type: "string",
  validate: (value) => (isMongoId(value) ? true : `${label} must be a valid id`),
});

const transactionDateValidator = {
  required: false,
  type: "string",
  transform: trimValue,
  validate: (value) =>
    isValidDate(value) ? true : "transactionDate must be a valid date",
};

export const createAssetValidator = {
  fullName: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "Full name is required"),
  },
  categoryId: {
    required: true,
    type: "string",
    validate: (value) => (isMongoId(value) ? true : "categoryId must be a valid id"),
  },
  makeModelId: objectIdValidator("makeModelId"),
  processorId: objectIdValidator("processorId"),
  transactionDate: transactionDateValidator,
  serialNumber: {
    required: false,
    type: "string",
    transform: trimValue,
  },
  status: {
    required: false,
    type: "string",
    enum: ASSET_STATUSES,
    message: `status must be one of: ${ASSET_STATUSES.join(", ")}`,
  },
};

export const updateAssetValidator = {
  fullName: {
    required: false,
    type: "string",
    minLength: 2,
    transform: trimValue,
  },
  categoryId: objectIdValidator("categoryId"),
  makeModelId: objectIdValidator("makeModelId"),
  processorId: objectIdValidator("processorId"),
  transactionDate: transactionDateValidator,
  serialNumber: {
    required: false,
    type: "string",
    transform: trimValue,
  },
  status: {
    required: false,
    type: "string",
    enum: ASSET_STATUSES,
    message: `status must be one of: ${ASSET_STATUSES.join(", ")}`,
  },
};

export const assetIdValidator = {
  id: {
    required: true,
    type: "string",
    validate: (value) => (isMongoId(value) ? true : "Invalid asset id"),
  },
};
