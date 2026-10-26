import Record from "../models/record.model.js";
import RecordType from "../models/record-type.model.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Category from "../models/category.model.js";

export const getSummary = async ({ recordTypeId } = {}, workspaceOwnerId) => {
  const recordFilter = { workspaceOwnerId };
  if (recordTypeId) recordFilter.recordTypeId = recordTypeId;
  const [totalRecords, byStatus, byType, totalRecordTypes, totalGroups, totalPeople, totalCategories] = await Promise.all([
    Record.countDocuments(recordFilter),
    Record.aggregate([
      { $match: recordFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Record.aggregate([
      { $match: recordFilter },
      { $group: { _id: "$recordTypeId", count: { $sum: 1 } } },
      { $lookup: { from: "recordtypes", localField: "_id", foreignField: "_id", as: "recordType" } },
      { $unwind: "$recordType" },
      { $match: { "recordType.workspaceOwnerId": workspaceOwnerId } },
      { $project: { key: "$recordType.key", name: "$recordType.name", count: 1 } },
      { $sort: { name: 1 } },
    ]),
    RecordType.countDocuments({ isActive: true, workspaceOwnerId }),
    Group.countDocuments({ isActive: true, workspaceOwnerId }),
    Person.countDocuments({ isActive: true, workspaceOwnerId }),
    Category.countDocuments({ workspaceOwnerId }),
  ]);

  return {
    totalRecords,
    byStatus: byStatus.reduce((result, item) => {
      result[item._id] = item.count;
      return result;
    }, {}),
    byType,
    totalRecordTypes,
    totalGroups,
    totalPeople,
    totalCategories,
  };
};
