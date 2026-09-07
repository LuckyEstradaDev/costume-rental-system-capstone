import mongoose from "mongoose";
import {outfitSchema} from "./OutfitModel.js";

const bundleSchema = new mongoose.Schema(
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
    price: {
      type: Number,
      required: true,
    },
    rentalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Bundles", bundleSchema);
