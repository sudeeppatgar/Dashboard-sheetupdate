import { isMongoId, isNonEmptyString, trimValue } from "../utils/validators.js";

const objectIdValidator = (label) => ({
  required: false,
  type: "string",
  validate: (value) => (isMongoId(value) ? true : `${label} must be a valid id`),
});

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
  serialNumber: {
    required: false,
    type: "string",
    transform: trimValue,
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
  serialNumber: {
    required: false,
    type: "string",
    transform: trimValue,
  },
};

export const assetIdValidator = {
  id: {
    required: true,
    type: "string",
    validate: (value) => (isMongoId(value) ? true : "Invalid asset id"),
  },
};
