import { isNonEmptyString, trimValue } from "../utils/validators.js";

export const createCategoryValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) =>
      isNonEmptyString(value) ? true : "Category name is required",
  },
};

export const updateCategoryValidator = {
  name: {
    required: false,
    type: "string",
    minLength: 2,
    transform: trimValue,
  },
};

export const categoryIdValidator = {
  id: {
    required: true,
    type: "string",
    pattern: /^[0-9a-fA-F]{24}$/,
    message: "Invalid category id",
  },
};
