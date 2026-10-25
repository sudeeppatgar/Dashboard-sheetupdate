import Record from "../models/record.model.js";
import RecordType from "../models/record-type.model.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";

export const getGenericSummary = async ({ recordTypeId } = {}) => {
  const recordFilter = recordTypeId ? { recordTypeId } : {};
  const [totalRecords, byStatus, byType, totalRecordTypes, totalGroups, totalPeople] = await Promise.all([
    Record.countDocuments(recordFilter),
    Record.aggregate([
      { $match: recordFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Record.aggregate([
      { $match: recordFilter },
      { $group: { _id: "$recordTypeId", count: { $sum: 1 } } },
      { $lookup: { from: "recordtypes", localField: "_id", foreignField: "_id", as: "recordType" } },
      { $unwind: { path: "$recordType", preserveNullAndEmptyArrays: true } },
      { $project: { key: "$recordType.key", name: "$recordType.name", count: 1 } },
      { $sort: { name: 1 } },
    ]),
    RecordType.countDocuments({ isActive: true }),
    Group.countDocuments({ isActive: true }),
    Person.countDocuments({ isActive: true }),
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
  };
};
