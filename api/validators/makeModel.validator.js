import { isNonEmptyString, trimValue } from "../utils/validators.js";

export const createMakeModelValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) =>
      isNonEmptyString(value) ? true : "Make model name is required",
  },
};

export const updateMakeModelValidator = {
  name: {
    required: false,
    type: "string",
    minLength: 2,
    transform: trimValue,
  },
};

export const makeModelIdValidator = {
  id: {
    required: true,
    type: "string",
    pattern: /^[0-9a-fA-F]{24}$/,
    message: "Invalid make model id",
  },
};
