import mongoose from "mongoose";
import {packageSnapshotSchema} from "./PackageSnapshotModel.js";

const packageCartSchema = new mongoose.Schema(
  {
    userId: {type: String, required: true},
    packageItems: [packageSnapshotSchema],
  },
  {timestamps: true, strict: false},
);

export const PackageCartModel = mongoose.model(
  "PackageCart",
  packageCartSchema,
);
