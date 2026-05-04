import mongoose, {Schema} from "mongoose";
import {snapshotSchema} from "./SnapshotModel.js";

const rentPaymentSchema = new Schema(
  {
    method: {type: String},
    transactionId: {type: String},
    paidAt: {type: Date},
  },
  {_id: false},
);

const rentSchema = new mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users", // optional but recommended
    },

    type: {
      type: String,
      enum: ["rent"],
      default: "rent",
      required: true,
    },

    // aligned with Order.items
    items: {
      type: [snapshotSchema],
      required: true,
    },

    rentalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    pickupTime: {
      type: Date,
    },

    // should NOT be required initially
    returnTime: {
      type: Date,
    },

    // added financial tracking
    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "overdue", "returned", "cancelled"],
      default: "pending",
    },

    // added payment tracking
    payment: rentPaymentSchema,
  },
  {
    timestamps: true,
  },
);

export const RentModel = mongoose.model("Rents", rentSchema);
