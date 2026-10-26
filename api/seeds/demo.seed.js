import mongoose from "mongoose";
import { config } from "../config/index.js";
import { connectDB } from "../config/db.js";
import RecordType from "../models/record-type.model.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Category from "../models/category.model.js";
import User from "../models/user.model.js";

const run = async () => {
  await connectDB();
  const admin = await User.findOne({ email: "admin@company.com", role: "admin" });
  if (!admin) throw new Error("Run npm run seed before npm run seed:demo");
  const workspaceOwnerId = admin._id;

  const recordType = await RecordType.findOneAndUpdate(
    { key: "equipment", workspaceOwnerId },
    {
      key: "equipment",
      name: "Equipment",
      pluralName: "Equipment",
      description: "Physical resources tracked by the organization.",
      statuses: [
        { key: "available", label: "Available" },
        { key: "assigned", label: "Assigned" },
        { key: "maintenance", label: "In service" },
        { key: "retired", label: "Archived", terminal: true },
      ],
      assignment: { enabled: true, assignedStatus: "assigned", availableStatus: "available" },
      fields: [
        { key: "condition", label: "Condition", type: "select", options: ["new", "good", "fair", "damaged", "under-repair"] },
        { key: "warranty-start", label: "Warranty start", type: "date" },
        { key: "warranty-end", label: "Warranty end", type: "date" },
      ],
      isActive: true,
      workspaceOwnerId,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

  const groups = await Group.insertMany(
    [
      { name: "Engineering", key: "engineering", isActive: true, workspaceOwnerId },
      { name: "Operations", key: "operations", isActive: true, workspaceOwnerId },
      { name: "Finance", key: "finance", isActive: true, workspaceOwnerId },
    ],
    { ordered: false },
  ).catch(() => []);
  const engineering = groups.find((group) => group.key === "engineering") || await Group.findOne({ key: "engineering", workspaceOwnerId });

  await Person.insertMany(
    [
      { name: "Demo Person", reference: "DEMO-001", email: "demo.person@example.com", groupId: engineering?._id, isActive: true, workspaceOwnerId },
    ],
    { ordered: false },
  ).catch(() => []);
  await Category.insertMany([{ name: "General", workspaceOwnerId }], { ordered: false }).catch(() => []);

  console.log(`Generic demo seed complete using ${config.dbUri ? "configured" : "missing"} MongoDB URI (${recordType.name})`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Generic demo seed failed:", error.message);
  process.exit(1);
});
