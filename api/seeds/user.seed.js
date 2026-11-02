import User from "../models/user.model.js";
import { config } from "../config/index.js";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Workspace from "../models/workspace.model.js";

const seedUser = async () => {
  const exists = await User.findOne({
    email: "admin@company.com",
  });

  if (exists) {
    if (!exists.workspaceOwnerId) {
      exists.workspaceOwnerId = exists._id;
    }
    let workspace = exists.workspaceId ? await Workspace.findById(exists.workspaceId) : await Workspace.findOne({ ownerId: exists._id });
    if (!workspace) {
      workspace = await Workspace.create({ name: "Operations Workspace", slug: "operations-workspace", ownerId: exists._id });
    }
    exists.workspaceId = workspace._id;
    await exists.save();
    console.log("Admin already exists");
    return;
  }

  const admin = new User({
    name: "Admin",
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
  });

  admin.workspaceOwnerId = admin._id;
  await admin.save();
  const workspace = await Workspace.create({ name: "Operations Workspace", slug: "operations-workspace", ownerId: admin._id });
  admin.workspaceId = workspace._id;
  await admin.save();

  console.log("Admin user created");
};

export default seedUser;

const isMainModule = process.argv[1]?.endsWith("user.seed.js");

if (isMainModule) {
  (async () => {
    await connectDB();
    await seedUser();
    await mongoose.disconnect();
    console.log(`Seed complete using ${config.dbUri ? "configured" : "missing"} MongoDB URI`);
  })().catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  });
}
