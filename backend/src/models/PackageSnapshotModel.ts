import mongoose from "mongoose";

export const packageSnapshotSchema = new mongoose.Schema(
  {
    packageId: {type: String, required: true},
    name: {type: String, required: true},
    imageURL: {type: [String], required: true},
    items: {
      type: [
        {
          _id: {type: String, required: true},
          variantId: {type: String, required: true},
          size: {type: String, required: true},
          quantity: {type: Number, required: true},
          purchasePrice: {type: Number, required: true},
          rentalPrice: {type: Number, required: true},
        },
      ],
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
