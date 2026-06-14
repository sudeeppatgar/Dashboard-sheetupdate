import { isNonEmptyString, trimValue } from "../utils/validators.js";

export const createProcessorValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) =>
      isNonEmptyString(value) ? true : "Processor name is required",
  },
};

export const updateProcessorValidator = {
  name: {
    required: false,
    type: "string",
    minLength: 2,
    transform: trimValue,
  },
};

export const processorIdValidator = {
  id: {
    required: true,
    type: "string",
    pattern: /^[0-9a-fA-F]{24}$/,
    message: "Invalid processor id",
  },
};
