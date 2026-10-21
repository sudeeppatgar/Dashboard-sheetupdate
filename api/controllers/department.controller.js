import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createDepartment as createDepartmentRecord,
  getDepartments as getDepartmentRecords,
  getDepartmentById,
  updateDepartment as updateDepartmentRecord,
  toggleDepartmentStatus as toggleDepartmentStatusRecord,
  deleteDepartment as deleteDepartmentRecord,
} from "../services/departments.service.js";

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await createDepartmentRecord(req.body);
  res.status(201).json(new ApiResponse(201, department, "Department created"));
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await getDepartmentRecords(req.query);
  res.json(new ApiResponse(200, departments, "Departments fetched"));
});

export const getDepartment = asyncHandler(async (req, res) => {
  const department = await getDepartmentById(req.params.id);
  res.json(new ApiResponse(200, department, "Department fetched"));
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await updateDepartmentRecord(req.params.id, req.body);
  res.json(new ApiResponse(200, department, "Department updated"));
});

export const toggleDepartmentStatus = asyncHandler(async (req, res) => {
  const department = await toggleDepartmentStatusRecord(req.params.id, req.body.isActive);
  res.json(new ApiResponse(200, department, "Department status updated"));
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await deleteDepartmentRecord(req.params.id);
  res.json(new ApiResponse(200, null, "Department deleted"));
});
