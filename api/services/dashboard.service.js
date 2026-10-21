import Asset from "../models/asset.model.js";
import Employee from "../models/employee.model.js";
import Department from "../models/department.model.js";

export const getSummary = async () => {
  const [total, byStatus] = await Promise.all([
    Asset.countDocuments(),
    Asset.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const statusMap = byStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {});
  return {
    totalAssets: total,
    byStatus: statusMap,
    totalEmployees: await Employee.countDocuments(),
    totalDepartments: await Department.countDocuments(),
  };
};

export const getAssetsByStatus = async () => Asset.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

export const getAssetsByCategory = async () =>
  Asset.aggregate([
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $project: { name: "$category.name", count: 1 } },
  ]);

export const getAssetsByDepartment = async () =>
  Asset.aggregate([
    { $match: { assignedEmployeeId: { $exists: true } } },
    { $lookup: { from: "employees", localField: "assignedEmployeeId", foreignField: "_id", as: "emp" } },
    { $unwind: "$emp" },
    { $group: { _id: "$emp.departmentId", count: { $sum: 1 } } },
    { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "dept" } },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    { $project: { name: "$dept.name", count: 1 } },
  ]);

export const getWarrantyExpiring = async (days = 30) => {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return Asset.find({
    warrantyEndDate: { $gte: now, $lte: future },
    status: { $ne: "retired" },
  }).populate("assignedEmployeeId");
};
