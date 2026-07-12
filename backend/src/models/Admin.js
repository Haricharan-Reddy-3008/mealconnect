import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "moderator", "verifier"],
      default: "moderator",
    },

    // Permissions
    canVerifyRestaurants: { type: Boolean, default: false },
    canVerifyNGOs: { type: Boolean, default: false },
    canBanUsers: { type: Boolean, default: false },
    canDeleteFoods: { type: Boolean, default: false },
    canViewAuditLogs: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },

    // Activity tracking
    totalVerifications: { type: Number, default: 0 },
    totalBans: { type: Number, default: 0 },
    lastActivity: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

adminSchema.index({ userId: 1 });
adminSchema.index({ role: 1 });

export default mongoose.model("Admin", adminSchema);
