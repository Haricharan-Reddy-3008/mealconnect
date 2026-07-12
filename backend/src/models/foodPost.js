import mongoose from "mongoose";

const foodPostSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    food_name: { type: String, required: true },
    quantity: { type: String, default: "Not specified" },
    description: String,
    expiry_time: { type: Date, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    // Enhanced status tracking
    status: {
      type: String,
      enum: [
        "available",
        "claim_requested",
        "claimed",
        "in_transit",
        "collected",
        "expired",
        "rejected",
      ],
      default: "available",
    },
    city: { type: String, required: true },

    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    claimedAt: Date,
    claimApprovedAt: Date,
    claimApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    claimRejectReason: String,

    // Collection tracking
    collectionStartedAt: Date,
    collectedAt: Date,
    collectionProof: {
      image: String,
      public_id: String,
      timestamp: Date,
    },
    // Evidence uploaded by the NGO after the food is distributed. Keeping it
    // separate from collectionProof makes the collection and impact audit
    // trails independently reviewable.
    distributionProof: [
      {
        url: String,
        public_id: String,
        uploadedAt: Date,
      },
    ],

    // Audit trail
    claimHistory: [
      {
        ngoId: mongoose.Schema.Types.ObjectId,
        action: String,
        timestamp: Date,
        reason: String,
      },
    ],

    food_image: [
      {
        url: String,
        public_id: String,
      },
    ],

    expiredAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

foodPostSchema.index({ location: "2dsphere" });
foodPostSchema.index({ status: 1 });
foodPostSchema.index({ restaurantId: 1 });
foodPostSchema.index({ claimedBy: 1 });

export default mongoose.model("FoodPost", foodPostSchema);
