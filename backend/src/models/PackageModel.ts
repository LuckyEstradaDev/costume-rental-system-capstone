import mongoose from "mongoose";
import {outfitSchema} from "./OutfitModel.js";

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageURL: {
      type: [String],
      required: true,
    },
    items: {
      type: [outfitSchema],
      required: true,
    },
    mode: {
      type: String,
      enum: ["rental", "purchase", "both"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Packages", packageSchema);
