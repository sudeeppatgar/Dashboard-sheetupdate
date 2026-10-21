import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeNumber: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    jobTitle: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ isActive: 1 });
employeeSchema.index({ name: 1 });

export default mongoose.model("Employee", employeeSchema);
