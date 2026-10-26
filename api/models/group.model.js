import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    workspaceOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

groupSchema.index({ isActive: 1 });
groupSchema.index({ name: 1 });
groupSchema.index({ workspaceOwnerId: 1, key: 1 }, { unique: true });

export default mongoose.model("Group", groupSchema);
