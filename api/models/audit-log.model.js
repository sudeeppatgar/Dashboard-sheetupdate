import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.Mixed, required: true },
    summary: { type: String, required: true },
    changes: { type: mongoose.Schema.Types.Mixed },
    requestId: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("AuditLog", auditLogSchema);
