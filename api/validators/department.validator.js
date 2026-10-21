import { isNonEmptyString, trimValue } from "../utils/validators.js";

export const createDepartmentValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "Department name is required"),
  },
  code: {
    required: true,
    type: "string",
    minLength: 2,
    transform: (value) => (typeof value === "string" ? value.trim().toUpperCase() : value),
    validate: (value) => (isNonEmptyString(value) ? true : "Department code is required"),
  },
  description: {
    required: false,
    type: "string",
    transform: trimValue,
  },
};

export const updateDepartmentValidator = {
  name: { required: false, type: "string", minLength: 2, transform: trimValue },
  code: { required: false, type: "string", minLength: 2, transform: (value) => (typeof value === "string" ? value.trim().toUpperCase() : value) },
  description: { required: false, type: "string", transform: trimValue },
  isActive: { required: false, type: "boolean" },
};

export const departmentIdValidator = {
  id: {
    required: true,
    type: "string",
    pattern: /^[0-9a-fA-F]{24}$/,
    message: "Invalid department id",
  },
};
