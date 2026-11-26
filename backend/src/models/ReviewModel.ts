import mongoose from "mongoose";
import {nanoid} from "nanoid";

const reviewSchema = new mongoose.Schema(
  {
    referenceID: {
      type: String,
      unique: true,
      required: true,
    },

    outfitID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userSnapshot: {
      fullname: {
        type: String,
        required: true,
      },
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    commentHidden: {type: Boolean, default: false},
    replyRole: {type: String, enum: ["admin", "staff"]},
    reply: {type: String, trim: true, maxlength: 2000},
    comment: {
      type: String,
      required: false,
    },
  },

  {timestamps: true},
);

reviewSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `REV-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export const ReviewModel = mongoose.model("Review", reviewSchema);
