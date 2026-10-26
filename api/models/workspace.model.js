import mongoose from "mongoose";

const workspaceConfigSchema = new mongoose.Schema(
  {
    appName: { type: String, trim: true },
    appTagline: { type: String, trim: true },
    recordSingular: { type: String, trim: true },
    recordPlural: { type: String, trim: true },
    categorySingular: { type: String, trim: true },
    categoryPlural: { type: String, trim: true },
    typeSingular: { type: String, trim: true },
    typePlural: { type: String, trim: true },
    groupSingular: { type: String, trim: true },
    groupPlural: { type: String, trim: true },
    personSingular: { type: String, trim: true },
    personPlural: { type: String, trim: true },
    identifierLabel: { type: String, trim: true },
    acquisitionDateLabel: { type: String, trim: true },
    statusLabels: { type: Map, of: String, default: () => ({}) },
  },
  { _id: false },
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    config: { type: workspaceConfigSchema, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Workspace", workspaceSchema);
