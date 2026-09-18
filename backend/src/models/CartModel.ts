import mongoose from "mongoose";
import {snapshotSchema} from "./SnapshotModel.js";
import {packageSnapshotSchema} from "./PackageSnapshotModel.js";

const cartSchema = new mongoose.Schema(
  {
    userId: {type: String, required: true},
    items: [snapshotSchema, packageSnapshotSchema],
  },
  {timestamps: true, strict: false},
);

export const CartModel = mongoose.model("Cart", cartSchema);
