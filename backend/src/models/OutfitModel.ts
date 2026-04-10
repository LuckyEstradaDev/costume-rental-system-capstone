import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
    },
    variants: [
      {
        size: {type: String, required: true},
        color: {type: String, required: true},
        stock: {type: Number, required: true, default: 0},
      },
    ],
    stock: {
      type: Number,
    },
    price: {
      type: Number,
    },
    outfitsSold: {
      type: Number,
    },
    outfits_rented: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export const OutfitModel = mongoose.model("Outfits", outfitSchema);
