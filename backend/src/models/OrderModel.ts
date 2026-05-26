import mongoose, {Schema} from "mongoose";
import {snapshotSchema} from "./SnapshotModel.js";
import {nanoid} from "nanoid";

const orderSchema = new mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    referenceID: {
      type: String,
      unique: true,
      required: true,
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
    paymentMethod: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `ORD-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export const OrderModel = mongoose.model("Orders", orderSchema);
