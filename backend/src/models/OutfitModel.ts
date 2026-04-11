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
        _id: false,
        size: {type: String, required: true},
        color: {type: String, required: true},
        stock: {type: Number, required: true, default: 0},
      },
    ],
    price: {
      type: Number,
    },
    // outfitsSold: {
    //   type: Number,
    // },
    // outfits_rented: {
    //   type: Number,
    // },
  },
  {
    timestamps: true,
  },
);

export const OutfitModel = mongoose.model("Outfits", outfitSchema);
