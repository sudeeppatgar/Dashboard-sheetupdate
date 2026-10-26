import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    recordTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecordType",
      required: true,
    },
    reference: { type: String, trim: true },
    status: { type: String, required: true, trim: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
    },
    location: { type: String, trim: true },
    acquiredAt: Date,
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workspaceOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

recordSchema.index({ recordTypeId: 1, createdAt: -1 });
recordSchema.index({ recordTypeId: 1, status: 1 });
recordSchema.index({ workspaceOwnerId: 1, recordTypeId: 1, reference: 1 }, { unique: true, sparse: true });
recordSchema.index({ groupId: 1 });
recordSchema.index({ personId: 1 });
recordSchema.index({ workspaceOwnerId: 1, createdAt: -1 });

export default mongoose.model("Record", recordSchema);
