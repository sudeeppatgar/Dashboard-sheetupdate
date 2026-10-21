import { isNonEmptyString, trimValue } from "../utils/validators.js";

export const createEmployeeValidator = {
  employeeNumber: { required: true, type: "string", minLength: 1, transform: trimValue, validate: (v) => (isNonEmptyString(v) ? true : "Employee number is required") },
  name: { required: true, type: "string", minLength: 2, transform: trimValue, validate: (v) => (isNonEmptyString(v) ? true : "Name is required") },
  email: { required: true, type: "string", transform: (v) => (typeof v === "string" ? v.trim().toLowerCase() : v), validate: (v) => (isNonEmptyString(v) ? true : "Email is required") },
  departmentId: { required: true, type: "string", pattern: /^[0-9a-fA-F]{24}$/, message: "Invalid department id" },
  jobTitle: { required: false, type: "string", transform: trimValue },
  phone: { required: false, type: "string", transform: trimValue },
  location: { required: false, type: "string", transform: trimValue },
};

export const updateEmployeeValidator = {
  employeeNumber: { required: false, type: "string", minLength: 1, transform: trimValue },
  name: { required: false, type: "string", minLength: 2, transform: trimValue },
  email: { required: false, type: "string", transform: (v) => (typeof v === "string" ? v.trim().toLowerCase() : v) },
  departmentId: { required: false, type: "string", pattern: /^[0-9a-fA-F]{24}$/, message: "Invalid department id" },
  jobTitle: { required: false, type: "string", transform: trimValue },
  phone: { required: false, type: "string", transform: trimValue },
  location: { required: false, type: "string", transform: trimValue },
  isActive: { required: false, type: "boolean" },
};

export const employeeIdValidator = {
  id: { required: true, type: "string", pattern: /^[0-9a-fA-F]{24}$/, message: "Invalid employee id" },
};
