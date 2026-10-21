import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createEmployee as createEmployeeRecord,
  getEmployees as getEmployeeRecords,
  getEmployeeById,
  updateEmployee as updateEmployeeRecord,
  toggleEmployeeStatus as toggleEmployeeStatusRecord,
  deleteEmployee as deleteEmployeeRecord,
} from "../services/employees.service.js";

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await createEmployeeRecord(req.body);
  res.status(201).json(new ApiResponse(201, employee, "Employee created"));
});

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await getEmployeeRecords(req.query);
  res.json(new ApiResponse(200, employees, "Employees fetched"));
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(req.params.id);
  res.json(new ApiResponse(200, employee, "Employee fetched"));
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await updateEmployeeRecord(req.params.id, req.body);
  res.json(new ApiResponse(200, employee, "Employee updated"));
});

export const toggleEmployeeStatus = asyncHandler(async (req, res) => {
  const employee = await toggleEmployeeStatusRecord(req.params.id, req.body.isActive);
  res.json(new ApiResponse(200, employee, "Employee status updated"));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  await deleteEmployeeRecord(req.params.id);
  res.json(new ApiResponse(200, null, "Employee deleted"));
});
