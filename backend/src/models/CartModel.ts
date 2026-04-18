import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {type: String, required: true},
    items: [
      {
        _id: false,
        productId: {type: String, required: true},
        quantity: {type: Number, required: true},
      },
    ],
  },
  {timestamps: true},
);

export const CartModel = mongoose.model("Cart", cartSchema);
