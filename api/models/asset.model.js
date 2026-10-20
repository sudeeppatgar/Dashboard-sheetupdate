import mongoose from "mongoose";

export const ASSET_STATUSES = [
  "available",
  "assigned",
  "maintenance",
  "retired",
];

const assetSchema = new mongoose.Schema(
  {
    transactionDate: Date,

    fullName: {
      type: String,
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    makeModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MakeModel",
    },

    processorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Processor",
    },

    serialNumber: String,

    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
