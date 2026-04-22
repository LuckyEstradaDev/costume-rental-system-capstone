import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {type: String, required: true},
    items: [
      {
        _id: false,
        outfitId: {type: String, required: true},
        variantId: {type: String, required: true},
        size: {type: String, required: true},
        quantity: {type: Number, required: true},
        name: {type: String, required: true},
        category: {type: String, required: true},
        imageURL: {type: String, required: true},
        price: {type: Number, required: true},
      },
    ],
  },
  {timestamps: true, strict: false},
);

export const CartModel = mongoose.model("Cart", cartSchema);
