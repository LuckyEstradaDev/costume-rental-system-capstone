import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    outfitID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
    },
  },

  {timestamps: true, _id: false},
);

export const ReviewModel = mongoose.model("Review", reviewSchema);
