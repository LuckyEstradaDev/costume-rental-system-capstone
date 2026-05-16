import mongoose, {Schema} from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    outfitID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Outfits",
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
  {_id: false},
);

export const ReviewModel = mongoose.model("Review", reviewSchema);
