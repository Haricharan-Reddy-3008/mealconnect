import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    ratedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    raterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    foodPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodPost",
      required: true,
    },

    rating: { type: Number, required: true, min: 1, max: 5 },
    review: String,

    // Type of transaction
    transactionType: {
      type: String,
      enum: ["food_donation", "food_claim", "food_collection"],
      required: true,
    },

    // Criteria
    foodQuality: Number,
    timeliness: Number,
    behavior: Number,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

ratingSchema.index({ ratedUserId: 1 });
ratingSchema.index({ raterUserId: 1 });
ratingSchema.index({ foodPostId: 1 });

export default mongoose.model("Rating", ratingSchema);
