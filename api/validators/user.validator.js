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
