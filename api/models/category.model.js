import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workspaceOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

categorySchema.index({ workspaceOwnerId: 1, name: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
