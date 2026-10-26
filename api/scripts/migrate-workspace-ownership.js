import mongoose from "mongoose";
import { config } from "../config/index.js";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Group from "../models/group.model.js";
import RecordType from "../models/record-type.model.js";
import Person from "../models/person.model.js";
import Record from "../models/record.model.js";
import RecordAssignment from "../models/record-assignment.model.js";
import Workspace from "../models/workspace.model.js";

const getOwnerEmail = () => {
  const argument = process.argv.find((value) => value.startsWith("--email="));
  return (argument ? argument.slice("--email=".length) : process.env.WORKSPACE_OWNER_EMAIL)?.trim().toLowerCase();
};

const setMissingOwner = async (model, workspaceOwnerId, workspaceId) => {
  const result = await model.updateMany(
    { $or: [{ workspaceOwnerId: { $exists: false } }, { workspaceOwnerId: null }] },
    { $set: { workspaceOwnerId, workspaceId } },
  );
  return result.modifiedCount;
};

const run = async () => {
  const ownerEmail = getOwnerEmail();
  if (!ownerEmail) {
    throw new Error("Provide WORKSPACE_OWNER_EMAIL or --email=<admin email>");
  }

  await connectDB();
  const owner = await User.findOne({ email: ownerEmail, role: "admin" });
  if (!owner) throw new Error(`Admin user not found for ${ownerEmail}`);

  owner.workspaceOwnerId = owner._id;
  let workspace = owner.workspaceId ? await Workspace.findById(owner.workspaceId) : await Workspace.findOne({ ownerId: owner._id });
  if (!workspace) {
    workspace = await Workspace.create({
      name: `${owner.name}'s Workspace`,
      slug: `${owner.name}-${owner._id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      ownerId: owner._id,
      config: { appName: `${owner.name}'s Workspace` },
    });
  }
  owner.workspaceId = workspace._id;
  await owner.save();

  const counts = {};
  const legacyUsers = await User.updateMany(
    { role: "user", $or: [{ workspaceOwnerId: { $exists: false } }, { workspaceOwnerId: null }] },
    { $set: { workspaceOwnerId: owner._id, workspaceId: workspace._id } },
  );
  counts.users = legacyUsers.modifiedCount;
  for (const [name, model] of [
    ["categories", Category],
    ["groups", Group],
    ["recordTypes", RecordType],
    ["people", Person],
    ["records", Record],
    ["assignments", RecordAssignment],
  ]) {
    counts[name] = await setMissingOwner(model, owner._id, workspace._id);
  }

  const linkedUsers = await Person.find({ workspaceOwnerId: owner._id, userId: { $exists: true, $ne: null } }).select("userId");
  if (linkedUsers.length > 0) {
    await User.updateMany(
      { _id: { $in: linkedUsers.map((person) => person.userId) } },
      { $set: { workspaceOwnerId: owner._id, workspaceId: workspace._id } },
    );
  }

  for (const model of [Category, Group, RecordType, Person, Record, RecordAssignment, User, Workspace]) {
    await model.syncIndexes();
  }

  console.log(`Workspace ownership migration complete for ${ownerEmail}.`, counts);
  console.log("Legacy records without an owner were assigned to this admin workspace.");
};

run()
  .catch((error) => {
    console.error("Workspace ownership migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log(`Migration used ${config.dbUri ? "configured" : "missing"} MongoDB URI`);
  });
