import mongoose from "mongoose";
import { config } from "../config/index.js";
import { connectDB } from "../config/db.js";
import RecordType from "../models/record-type.model.js";
import Group from "../models/group.model.js";
import Person from "../models/person.model.js";
import Category from "../models/category.model.js";

const run = async () => {
  await connectDB();

  const recordType = await RecordType.findOneAndUpdate(
    { key: "equipment" },
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
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

  const groups = await Group.insertMany(
    [
      { name: "Engineering", key: "engineering", isActive: true },
      { name: "Operations", key: "operations", isActive: true },
      { name: "Finance", key: "finance", isActive: true },
    ],
    { ordered: false },
  ).catch(() => []);
  const engineering = groups.find((group) => group.key === "engineering") || await Group.findOne({ key: "engineering" });

  await Person.insertMany(
    [
      { name: "Demo Person", reference: "DEMO-001", email: "demo.person@example.com", groupId: engineering?._id, isActive: true },
    ],
    { ordered: false },
  ).catch(() => []);
  await Category.insertMany([{ name: "General" }], { ordered: false }).catch(() => []);

  console.log(`Generic demo seed complete using ${config.dbUri ? "configured" : "missing"} MongoDB URI (${recordType.name})`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Generic demo seed failed:", error.message);
  process.exit(1);
});
