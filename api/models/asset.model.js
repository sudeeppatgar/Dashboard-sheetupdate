import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
