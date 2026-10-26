import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    reference: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    loginEnabled: { type: Boolean, default: false },
    workspaceOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    title: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

personSchema.index({ userId: 1 }, { unique: true, sparse: true });
personSchema.index({ workspaceOwnerId: 1, reference: 1 }, { unique: true, sparse: true });
personSchema.index({ workspaceOwnerId: 1, email: 1 }, { unique: true, sparse: true });
personSchema.index({ groupId: 1 });
personSchema.index({ isActive: 1 });
personSchema.index({ name: 1 });

export default mongoose.model("Person", personSchema);
