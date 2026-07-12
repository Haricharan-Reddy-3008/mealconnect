import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true },
    resource: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    details: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ["success", "failure"], default: "success" },
    errorMessage: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
