import mongoose from "mongoose";

export const DEFAULT_RECORD_STATUSES = [
  { key: "active", label: "Active", terminal: false },
  { key: "in-progress", label: "In progress", terminal: false },
  { key: "completed", label: "Completed", terminal: true },
  { key: "archived", label: "Archived", terminal: true },
];

const recordStatusSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    terminal: { type: Boolean, default: false },
  },
  { _id: false },
);

const customFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "multiline", "number", "date", "boolean", "select"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: undefined },
  },
  { _id: false },
);

const recordTypeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
    },
    name: { type: String, required: true, trim: true },
    pluralName: { type: String, trim: true },
    description: { type: String, trim: true },
    statuses: {
      type: [recordStatusSchema],
      default: () => DEFAULT_RECORD_STATUSES,
    },
    fields: { type: [customFieldSchema], default: () => [] },
    assignment: {
      enabled: { type: Boolean, default: false },
      assignedStatus: { type: String, default: "assigned", trim: true },
      availableStatus: { type: String, default: "available", trim: true },
    },
    isActive: { type: Boolean, default: true },
    workspaceOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

recordTypeSchema.index({ isActive: 1 });
recordTypeSchema.index({ workspaceOwnerId: 1, key: 1 }, { unique: true });

export default mongoose.model("RecordType", recordTypeSchema);
