import mongoose from "mongoose";
import {packageCartItemSchema} from "./PackageCartItemModel.js";

const packageCartSchema = new mongoose.Schema(
  {
    userId: {type: String, required: true},
    packageItems: [packageCartItemSchema],
  },
  {timestamps: true, strict: false},
);

export const PackageCartModel = mongoose.model(
  "PackageCart",
  packageCartSchema,
);
