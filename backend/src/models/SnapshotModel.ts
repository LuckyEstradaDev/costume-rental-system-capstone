import mongoose from "mongoose";

export const snapshotSchema = new mongoose.Schema(
  {
    outfitId: {type: String, required: true},
    variantId: {type: String, required: true},
    size: {type: String, required: true},
    color: {type: String, required: true},
    quantity: {type: Number, required: true},
    name: {type: String, required: true},
    category: {type: String, required: true},
    imageURL: {type: String, required: true},
    price: {type: Number, required: true},
  },
  {_id: false},
);
