import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    // Admin accounts are created by a trusted operator, never from public signup.
    role: { type: String, enum: ["restaurant", "ngo", "admin"], required: true },
    address: { type: String, required: true },
    avatar: {
      url: String,
      public_id: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    city: { type: String, required: true },
    contactInfo: { type: String, required: true },

    // Email verification
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,

    // Role verification (admin approves restaurants/NGOs)
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationDocuments: [
      {
        url: String,
        public_id: String,
        uploadedAt: Date,
      },
    ],
    rejectionReason: String,

    // Reputation & Trust
    rating: { type: Number, default: 5, min: 1, max: 5 },
    totalRatings: { type: Number, default: 0 },
    foodsPosted: { type: Number, default: 0 },
    foodsClaimed: { type: Number, default: 0 },
    foodsCollected: { type: Number, default: 0 },

    // Security
    isBanned: { type: Boolean, default: false },
    banReason: String,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ isBanned: 1 });

export default mongoose.model("User", userSchema);
