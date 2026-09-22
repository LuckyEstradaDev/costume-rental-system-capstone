import mongoose from "mongoose";
import {snapshotSchema} from "./SnapshotModel.js";

export const packageSnapshotSchema = new mongoose.Schema(
  {
    packageId: {type: String, required: true},
    name: {type: String, required: true},
    imageURL: {type: [String], required: true},
    items: {
      type: [snapshotSchema],
      required: true,
    },
    mode: {
      type: String,
      enum: ["rental", "purchase", "both"],
      required: true,
    },
    purchaseTotal: {type: Number},
    rentalTotal: {type: Number},
  },
  {_id: false, timestamps: true},
);