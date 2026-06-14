import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
  try {
    if (!config.dbUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(config.dbUri);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
