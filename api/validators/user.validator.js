import User from "../models/user.model.js";
import {
  isEmail,
  isNonEmptyString,
  isPhoneNumber,
  strongPasswordRegex,
  trimValue,
} from "../utils/validators.js";

export const registerValidator = {
  name: {
    required: true,
    type: "string",
    minLength: 2,
    transform: trimValue,
    message: "Name must be at least 2 characters",
  },
  email: {
    required: true,
    type: "string",
    transform: (value) => trimValue(value).toLowerCase(),
    validate: async (value) => {
      if (!isEmail(value)) {
        return "Invalid email address";
      }

      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        return "Email already registered";
      }

      return true;
    },
  },
  password: {
    required: true,
    type: "string",
    validate: (value) =>
      strongPasswordRegex.test(value)
        ? true
        : "Password must be at least 6 characters long and include 1 uppercase letter, 1 number, and 1 special character",
  },
  phoneNumber: {
    required: false,
    type: "string",
    validate: (value) => (isPhoneNumber(value) ? true : "Invalid phone number"),
  },
};

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

export const updateProfileValidator = {
  name: {
    required: false,
    type: "string",
    minLength: 2,
    transform: trimValue,
    validate: (value) => (isNonEmptyString(value) ? true : "Name must be at least 2 characters"),
  },
  phoneNumber: {
    required: false,
    type: "string",
    validate: (value) => (isPhoneNumber(value) ? true : "Invalid phone number"),
  },
  bio: {
    required: false,
    type: "string",
    maxLength: 500,
    transform: trimValue,
  },
  password: {
    required: false,
    type: "string",
    validate: (value) =>
      strongPasswordRegex.test(value)
        ? true
        : "Password must contain 1 uppercase, 1 number, and 1 special character",
  },
};
