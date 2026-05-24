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
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },

    paymentID: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = mongoose.model("Orders", orderSchema);
