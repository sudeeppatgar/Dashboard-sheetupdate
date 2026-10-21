import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import Department from "../models/department.model.js";

export const createDepartment = (data) => Department.create(data);

export const getDepartments = async (filters = {}) => {
  const query = {};
  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [{ name: regex }, { code: regex }];
  }
  if (typeof filters.isActive !== "undefined") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  return Department.find(query).sort({ createdAt: -1 });
};

export const getDepartmentById = async (id) => {
  const department = await Department.findById(id);
  if (!department) throw new ApiError(404, "Department not found");
  return department;
};

export const updateDepartment = async (id, data) => {
  const department = await Department.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, "Department not found");
  return department;
};

export const toggleDepartmentStatus = async (id, isActive) => {
  const department = await Department.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!department) throw new ApiError(404, "Department not found");
  return department;
};

export const deleteDepartment = async (id) => {
  const department = await Department.findById(id);
  if (!department) throw new ApiError(404, "Department not found");
  const EmployeeModel = mongoose.models.Employee;
  if (EmployeeModel) {
    const isReferenced = await EmployeeModel.exists({ departmentId: id });
    if (isReferenced) {
      throw new ApiError(409, "Cannot delete department because it is referenced by one or more employees");
    }
  }
  await Department.findByIdAndDelete(id);
  return department;
};
