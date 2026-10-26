import mongoose from "mongoose";

const recordAssignmentSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: { type: Date, default: Date.now },
    returnedAt: Date,
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    workspaceOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, trim: true },
    returnNotes: { type: String, trim: true },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

recordAssignmentSchema.index({ recordId: 1, returnedAt: 1 });
recordAssignmentSchema.index(
  { recordId: 1 },
  { unique: true, partialFilterExpression: { returnedAt: { $exists: false } } },
);

export default mongoose.model("RecordAssignment", recordAssignmentSchema);
