import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: Date.now },
    returnedAt: Date,
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    returnCondition: { type: String, enum: ["new", "good", "fair", "damaged", "under_repair"] },
    notes: String,
    returnNotes: String,
  },
  { timestamps: true }
);

assignmentSchema.index({ assetId: 1, returnedAt: 1 });

export default mongoose.model("AssetAssignment", assignmentSchema);
