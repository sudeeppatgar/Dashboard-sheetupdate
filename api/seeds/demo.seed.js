import mongoose from "mongoose";
import { config } from "../config/index.js";
import Department from "../models/department.model.js";
import Employee from "../models/employee.model.js";
import Category from "../models/category.model.js";
import Asset from "../models/asset.model.js";

const run = async () => {
  await mongoose.connect(config.mongoUri);
  const depts = await Department.insertMany([
    { name: "Engineering", code: "ENG", isActive: true },
    { name: "Operations", code: "OPS", isActive: true },
    { name: "Finance", code: "FIN", isActive: true },
  ], { ordered: false }).catch(() => {});
  const cats = await Category.insertMany([{ name: "Laptops" }, { name: "Monitors" }], { ordered: false }).catch(() => {});
  console.log("Seed complete");
  await mongoose.disconnect();
};

run().catch((e) => { console.error(e); process.exit(1); });
