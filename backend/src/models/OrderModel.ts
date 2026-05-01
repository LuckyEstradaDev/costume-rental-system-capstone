import mongoose, {Schema} from "mongoose";
import {snapshotSchema} from "./SnapshotModel.js";

const orderSchema = new mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["buy"],
      default: "buy",
      required: true,
    },

    items: [snapshotSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    payment: {
      method: String,
      transactionId: {
        type: String,
        unique: true,
        sparse: true,
      },
      paidAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = mongoose.model("Orders", orderSchema);
