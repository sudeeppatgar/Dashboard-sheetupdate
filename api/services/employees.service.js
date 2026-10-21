import { ApiError } from "../utils/ApiError.js";
import Employee from "../models/employee.model.js";
import Department from "../models/department.model.js";

export const createEmployee = async (data) => {
  const dept = await Department.findById(data.departmentId);
  if (!dept) throw new ApiError(400, "Department not found");
  return Employee.create(data);
};

export const getEmployees = async (filters = {}) => {
  const query = {};
  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [{ name: regex }, { employeeNumber: regex }, { email: regex }];
  }
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (typeof filters.isActive !== "undefined" && filters.isActive !== "") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  return Employee.find(query).populate("departmentId").sort({ createdAt: -1 });
};

export const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id).populate("departmentId");
  if (!employee) throw new ApiError(404, "Employee not found");
  return employee;
};

export const updateEmployee = async (id, data) => {
  if (data.departmentId) {
    const dept = await Department.findById(data.departmentId);
    if (!dept) throw new ApiError(400, "Department not found");
  }
  const employee = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("departmentId");
  if (!employee) throw new ApiError(404, "Employee not found");
  return employee;
};

export const toggleEmployeeStatus = async (id, isActive) => {
  const employee = await Employee.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true }).populate("departmentId");
  if (!employee) throw new ApiError(404, "Employee not found");
  return employee;
};

export const deleteEmployee = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new ApiError(404, "Employee not found");
  await Employee.findByIdAndDelete(id);
  return employee;
};
