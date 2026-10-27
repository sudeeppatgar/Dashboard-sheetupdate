import {
  isEmail,
  isNonEmptyString,
  trimValue,
} from "../utils/validators.js";

export const loginValidator = {
  email: {
    required: true,
    type: "string",
    transform: (value) => trimValue(value).toLowerCase(),
    validate: (value) => (isEmail(value) ? true : "Invalid email"),
  },
  password: {
    required: true,
    type: "string",
    validate: (value) => (isNonEmptyString(value) ? true : "Password is required"),
  },
};

export const registerAdminValidator = {
  workspaceName: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "Workspace name is required"),
  },
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "Name is required"),
  },
  email: loginValidator.email,
  password: {
    required: true,
    type: "string",
    minLength: 8,
    validate: (value) => (isNonEmptyString(value) ? true : "Password must be at least 8 characters"),
  },
  confirmPassword: {
    required: true,
    type: "string",
    validate: (value, source) => (value === source.password ? true : "Passwords do not match"),
  },
};
