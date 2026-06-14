import User from "../models/user.model.js";
import { config } from "../config/index.js";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";

const seedUser = async () => {
  const exists = await User.findOne({
    email: "admin@company.com",
  });

  if (exists) {
    console.log("Admin already exists");
    return;
  }

  await User.create({
    name: "Admin",
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
  });

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
