import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import RecordType from "../models/record-type.model.js";
import Record from "../models/record.model.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import RecordAssignment from "../models/record-assignment.model.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import { slugify } from "../utils/domain.js";

const LEGACY_STATUS_KEYS = ["available", "assigned", "maintenance", "retired"];

const readCollection = async (name) => {
  const collection = mongoose.connection.db.collection(name);
  return collection.find({}).toArray();
};

const migrateGroups = async (departments, workspaceOwnerId, workspaceId) => {
  const groupIds = new Map();
  for (const department of departments) {
    const key = slugify(department.code || department.name || String(department._id));
    const group = await Group.findOneAndUpdate(
      { key, workspaceOwnerId },
      {
        name: department.name || key,
        key,
        description: department.description,
        isActive: department.isActive !== false,
        workspaceOwnerId,
        workspaceId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    groupIds.set(String(department._id), group._id);
  }
  return groupIds;
};

const migratePeople = async (employees, groupIds, workspaceOwnerId, workspaceId) => {
  const personIds = new Map();
  for (const employee of employees) {
    const reference = employee.employeeNumber || `legacy-${employee._id}`;
    const person = await Person.findOneAndUpdate(
      { reference, workspaceOwnerId },
      {
        name: employee.name || reference,
        reference,
        email: employee.email,
        groupId: groupIds.get(String(employee.departmentId)),
        title: employee.jobTitle,
        phone: employee.phone,
        location: employee.location,
        isActive: employee.isActive !== false,
        workspaceOwnerId,
        workspaceId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    personIds.set(String(employee._id), person._id);
  }
  return personIds;
};

const getLegacyRecordType = async (workspaceOwnerId, workspaceId) =>
  RecordType.findOneAndUpdate(
    { key: "legacy-equipment", workspaceOwnerId },
    {
      key: "legacy-equipment",
      name: "Legacy Equipment",
      pluralName: "Legacy Equipment",
      description: "Records migrated from the original asset model.",
      statuses: LEGACY_STATUS_KEYS.map((key) => ({ key, label: key[0].toUpperCase() + key.slice(1) })),
      assignment: { enabled: true, assignedStatus: "assigned", availableStatus: "available" },
      fields: [
        { key: "condition", label: "Condition", type: "select", options: ["new", "good", "fair", "damaged", "under_repair"] },
        { key: "warranty-start", label: "Warranty start", type: "date" },
        { key: "warranty-end", label: "Warranty end", type: "date" },
        { key: "legacy-make-model", label: "Legacy make/model", type: "text" },
      ],
      isActive: true,
      workspaceOwnerId,
      workspaceId,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

const migrateRecords = async (assets, employees, personIds, groupIds, recordType, workspaceOwnerId, workspaceId) => {
  const recordIds = new Map();
  const employeeById = new Map(employees.map((employee) => [String(employee._id), employee]));
  const makeModels = await readCollection("makemodels");
  const makeModelById = new Map(makeModels.map((item) => [String(item._id), item]));

  for (const asset of assets) {
    const employee = employeeById.get(String(asset.assignedEmployeeId));
    const personId = personIds.get(String(asset.assignedEmployeeId));
    const customFields = {};
    if (asset.condition) customFields.condition = asset.condition;
    if (asset.warrantyStartDate) customFields["warranty-start"] = new Date(asset.warrantyStartDate).toISOString().slice(0, 10);
    if (asset.warrantyEndDate) customFields["warranty-end"] = new Date(asset.warrantyEndDate).toISOString().slice(0, 10);
    const makeModel = makeModelById.get(String(asset.makeModelId));
    if (makeModel?.name) customFields["legacy-make-model"] = makeModel.name;
    let reference = asset.serialNumber;
    if (reference) {
      const duplicate = await Record.exists({
        recordTypeId: recordType._id,
        reference,
        workspaceOwnerId,
        workspaceId,
        "metadata.legacyAssetId": { $ne: String(asset._id) },
      });
      if (duplicate) reference = `${reference}-${String(asset._id).slice(-6)}`;
    }

    const record = await Record.findOneAndUpdate(
      { "metadata.legacyAssetId": String(asset._id), workspaceOwnerId },
      {
        name: asset.fullName || `Legacy record ${asset._id}`,
        recordTypeId: recordType._id,
        reference,
        workspaceOwnerId,
        status: asset.status || "available",
        categoryId: asset.categoryId,
        groupId: employee ? groupIds.get(String(employee.departmentId)) : undefined,
        personId,
        location: asset.location,
        acquiredAt: asset.transactionDate,
        customFields,
        metadata: { legacyAssetId: String(asset._id), legacyEmployeeId: employee ? String(employee._id) : undefined },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    recordIds.set(String(asset._id), record._id);
  }
  return recordIds;
};

const migrateAssignments = async (assignments, recordIds, personIds, workspaceOwnerId, workspaceId) => {
  for (const assignment of assignments) {
    const recordId = recordIds.get(String(assignment.assetId));
    const personId = personIds.get(String(assignment.employeeId));
    if (!recordId || !personId || !assignment.assignedBy) continue;
    await RecordAssignment.findOneAndUpdate(
      { "metadata.legacyAssignmentId": String(assignment._id), workspaceOwnerId },
      {
        recordId,
        personId,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt,
        returnedAt: assignment.returnedAt,
        returnedBy: assignment.returnedBy,
        notes: assignment.notes,
        returnNotes: assignment.returnNotes,
        metadata: { legacyAssignmentId: String(assignment._id) },
        workspaceOwnerId,
        workspaceId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
  }
};

const run = async () => {
  await connectDB();
  const ownerEmail = process.env.WORKSPACE_OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) throw new Error("WORKSPACE_OWNER_EMAIL is required for legacy migration");
  const owner = await User.findOne({ email: ownerEmail, role: "admin" });
  if (!owner) throw new Error(`Admin user not found for ${ownerEmail}`);
  owner.workspaceOwnerId = owner._id;
  const workspace = owner.workspaceId ? await Workspace.findById(owner.workspaceId) : await Workspace.findOne({ ownerId: owner._id });
  if (!workspace) throw new Error("Workspace not found for legacy migration owner; run migrate:workspace first");
  owner.workspaceId = workspace._id;
  await owner.save();
  const [departments, employees, assets, assignments] = await Promise.all([
    readCollection("departments"),
    readCollection("employees"),
    readCollection("assets"),
    readCollection("assetassignments"),
  ]);
  const groupIds = await migrateGroups(departments, owner._id, workspace._id);
  const personIds = await migratePeople(employees, groupIds, owner._id, workspace._id);
  const recordType = await getLegacyRecordType(owner._id, workspace._id);
  const recordIds = await migrateRecords(assets, employees, personIds, groupIds, recordType, owner._id, workspace._id);
  await migrateAssignments(assignments, recordIds, personIds, owner._id, workspace._id);
  console.log(`Migrated ${departments.length} groups, ${employees.length} people, ${assets.length} records, and ${assignments.length} assignments.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Legacy migration failed:", error);
  process.exit(1);
});
