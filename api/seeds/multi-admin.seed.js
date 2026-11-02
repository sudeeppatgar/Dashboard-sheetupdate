import mongoose from "mongoose";
import { config } from "../config/index.js";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import Category from "../models/category.model.js";
import Group from "../models/group.model.js";
import RecordType from "../models/record-type.model.js";
import Record from "../models/record.model.js";
import Person from "../models/person.model.js";
import RecordAssignment from "../models/record-assignment.model.js";

const SEED_PASSWORD = process.env.SEED_PASSWORD || "12345678";

const adminSeeds = [
  {
    name: "Ganesh",
    email: "ganesh@gmail.com",
    workspaceName: "Ganesh Organization",
    workspaceSlug: "ganesh-organization",
    prefix: "GAN",
    people: [
      { key: "ganesh-employee-1", name: "Ganesh Employee One", email: "ganesh.employee1@gmail.com", title: "Operations Manager", group: "engineering" },
      { key: "ganesh-employee-2", name: "Ganesh Employee Two", email: "ganesh.employee2@gmail.com", title: "Field Coordinator", group: "operations" },
      { key: "ganesh-employee-3", name: "Ganesh Employee Three", email: "ganesh.employee3@gmail.com", title: "Finance Associate", group: "finance" },
    ],
  },
  {
    name: "Sudeep",
    email: "sudeep@gmail.com",
    workspaceName: "Sudeep Organization",
    workspaceSlug: "sudeep-organization",
    prefix: "SUD",
    people: [
      { key: "sudeep-employee-1", name: "Sudeep Employee One", email: "sudeep.employee1@gmail.com", title: "Operations Manager", group: "engineering" },
      { key: "sudeep-employee-2", name: "Sudeep Employee Two", email: "sudeep.employee2@gmail.com", title: "Field Coordinator", group: "operations" },
      { key: "sudeep-employee-3", name: "Sudeep Employee Three", email: "sudeep.employee3@gmail.com", title: "Finance Associate", group: "finance" },
    ],
  },
];

const categorySeeds = ["IT Assets", "Office Supplies", "Finance"];

const groupSeeds = [
  { key: "engineering", name: "Engineering", description: "Engineering and technical operations." },
  { key: "operations", name: "Operations", description: "Daily operations and field activities." },
  { key: "finance", name: "Finance", description: "Finance and administrative work." },
];

const recordTypeSeeds = [
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
      { key: "condition", label: "Condition", type: "select", options: ["new", "good", "fair", "damaged"] },
      { key: "purchase-date", label: "Purchase date", type: "date" },
    ],
  },
  {
    key: "documents",
    name: "Documents",
    pluralName: "Documents",
    description: "Policies, contracts, and other organizational documents.",
    statuses: [
      { key: "active", label: "Active" },
      { key: "in-progress", label: "In progress" },
      { key: "completed", label: "Completed", terminal: true },
      { key: "archived", label: "Archived", terminal: true },
    ],
    assignment: { enabled: false },
    fields: [
      { key: "document-owner", label: "Document owner", type: "text" },
      { key: "review-date", label: "Review date", type: "date" },
    ],
  },
];

const ensureAdmin = async (seed) => {
  let admin = await User.findOne({ email: seed.email });

  if (!admin) {
    admin = new User({ email: seed.email });
  }

  admin.name = seed.name;
  admin.password = SEED_PASSWORD;
  admin.role = "admin";
  admin.isActive = true;
  admin.workspaceOwnerId = admin._id;
  await admin.save();

  let workspace = admin.workspaceId ? await Workspace.findById(admin.workspaceId) : null;
  if (!workspace) workspace = await Workspace.findOne({ ownerId: admin._id });

  if (!workspace) {
    workspace = await Workspace.create({
      name: seed.workspaceName,
      slug: seed.workspaceSlug,
      ownerId: admin._id,
    });
  } else {
    workspace.name = seed.workspaceName;
    workspace.slug = seed.workspaceSlug;
    workspace.ownerId = admin._id;
    workspace.isActive = true;
    await workspace.save();
  }

  admin.workspaceId = workspace._id;
  await admin.save();
  return { admin, workspace };
};

const ensureCategories = async (workspaceOwnerId, workspaceId) => {
  const categories = new Map();

  for (const name of categorySeeds) {
    const category = await Category.findOneAndUpdate(
      { name, workspaceOwnerId },
      { name, workspaceOwnerId, workspaceId },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
    categories.set(name, category);
  }

  return categories;
};

const ensureGroups = async (workspaceOwnerId, workspaceId) => {
  const groups = new Map();

  for (const seed of groupSeeds) {
    const group = await Group.findOneAndUpdate(
      { key: seed.key, workspaceOwnerId },
      { ...seed, isActive: true, workspaceOwnerId, workspaceId },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
    groups.set(seed.key, group);
  }

  return groups;
};

const ensureRecordTypes = async (workspaceOwnerId, workspaceId) => {
  const recordTypes = new Map();

  for (const seed of recordTypeSeeds) {
    const recordType = await RecordType.findOneAndUpdate(
      { key: seed.key, workspaceOwnerId },
      { ...seed, isActive: true, workspaceOwnerId, workspaceId },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
    recordTypes.set(seed.key, recordType);
  }

  return recordTypes;
};

const ensurePeople = async (seed, admin, workspace) => {
  const people = new Map();

  for (const personSeed of seed.people) {
    let user = await User.findOne({ email: personSeed.email });

    if (!user) {
      user = new User({ email: personSeed.email });
    }

    user.name = personSeed.name;
    user.password = SEED_PASSWORD;
    user.role = "user";
    user.isActive = true;
    user.workspaceOwnerId = admin._id;
    user.workspaceId = workspace._id;
    await user.save();

    const group = await Group.findOne({ key: personSeed.group, workspaceOwnerId: admin._id });
    let person = await Person.findOne({ userId: user._id });
    if (!person) person = await Person.findOne({ email: personSeed.email, workspaceOwnerId: admin._id });
    if (!person) person = new Person({ email: personSeed.email });

    person.name = personSeed.name;
    person.reference = `${seed.prefix}-${personSeed.key.toUpperCase()}`;
    person.email = personSeed.email;
    person.userId = user._id;
    person.loginEnabled = true;
    person.workspaceOwnerId = admin._id;
    person.workspaceId = workspace._id;
    person.groupId = group?._id;
    person.title = personSeed.title;
    person.location = `${seed.name} Headquarters`;
    person.isActive = true;
    await person.save();
    people.set(personSeed.key, person);
  }

  return people;
};

const ensureRecords = async (seed, admin, workspace, categories, groups, recordTypes, people) => {
  const records = [
    {
      key: "equipment-1",
      name: `${seed.name} Laptop 01`,
      reference: `${seed.prefix}-EQ-001`,
      recordTypeKey: "equipment",
      status: "assigned",
      category: "IT Assets",
      group: "engineering",
      person: seed.people[0].key,
      location: `${seed.name} Headquarters`,
      customFields: { condition: "good", "purchase-date": "2026-01-15" },
    },
    {
      key: "equipment-2",
      name: `${seed.name} Projector`,
      reference: `${seed.prefix}-EQ-002`,
      recordTypeKey: "equipment",
      status: "available",
      category: "Office Supplies",
      group: "operations",
      location: `${seed.name} Meeting Room`,
      customFields: { condition: "new", "purchase-date": "2026-02-20" },
    },
    {
      key: "document-1",
      name: `${seed.name} Vendor Contract`,
      reference: `${seed.prefix}-DOC-001`,
      recordTypeKey: "documents",
      status: "active",
      category: "Finance",
      group: "finance",
      location: `${seed.name} Shared Drive`,
      customFields: { "document-owner": `${seed.name} Finance`, "review-date": "2026-12-01" },
    },
    {
      key: "document-2",
      name: `${seed.name} Operations Policy`,
      reference: `${seed.prefix}-DOC-002`,
      recordTypeKey: "documents",
      status: "completed",
      category: "Office Supplies",
      group: "operations",
      location: `${seed.name} Shared Drive`,
      customFields: { "document-owner": `${seed.name} Operations`, "review-date": "2027-01-15" },
    },
  ];

  for (const seedRecord of records) {
    const recordType = recordTypes.get(seedRecord.recordTypeKey);
    const record = await Record.findOneAndUpdate(
      { reference: seedRecord.reference, workspaceOwnerId: admin._id },
      {
        name: seedRecord.name,
        recordTypeId: recordType._id,
        reference: seedRecord.reference,
        status: seedRecord.status,
        categoryId: categories.get(seedRecord.category)?._id,
        groupId: groups.get(seedRecord.group)?._id,
        personId: seedRecord.person ? people.get(seedRecord.person)?._id : undefined,
        location: seedRecord.location,
        customFields: seedRecord.customFields,
        createdBy: admin._id,
        workspaceOwnerId: admin._id,
        workspaceId: workspace._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );

    if (seedRecord.person) {
      await RecordAssignment.findOneAndUpdate(
        { recordId: record._id, returnedAt: { $exists: false } },
        {
          recordId: record._id,
          personId: people.get(seedRecord.person)._id,
          assignedBy: admin._id,
          workspaceOwnerId: admin._id,
          workspaceId: workspace._id,
          notes: "Created by the development seed.",
        },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
      );
    }
  }

  return records.length;
};

export const seedWorkspaces = async () => {
  const results = [];

  for (const seed of adminSeeds) {
    const { admin, workspace } = await ensureAdmin(seed);
    const categories = await ensureCategories(admin._id, workspace._id);
    const groups = await ensureGroups(admin._id, workspace._id);
    const recordTypes = await ensureRecordTypes(admin._id, workspace._id);
    const people = await ensurePeople(seed, admin, workspace);
    const recordCount = await ensureRecords(seed, admin, workspace, categories, groups, recordTypes, people);
    results.push({ admin: seed.email, workspace: workspace.name, people: people.size, records: recordCount });
  }

  return results;
};

const isMainModule = process.argv[1]?.endsWith("multi-admin.seed.js");

if (isMainModule) {
  (async () => {
    await connectDB();
    const results = await seedWorkspaces();
    console.table(results);
    console.log(`Multi-admin seed complete using ${config.dbUri ? "configured" : "missing"} MongoDB URI`);
    await mongoose.disconnect();
  })().catch(async (error) => {
    console.error("Multi-admin seeding failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
}
