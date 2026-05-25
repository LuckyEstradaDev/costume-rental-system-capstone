import mongoose, {Schema} from "mongoose";
import {snapshotSchema} from "./SnapshotModel.js";
import {nanoid} from "nanoid";

const rentSchema = new mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users", // optional but recommended
    },

    referenceID: {
      type: String,
      unique: true,
      required: true,
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

    //this is the time pickuped by the customer
    pickupTime: {
      type: Date,
    },

    // should NOT be required initially
    //the time returned by the user
    //this
    returnTime: {
      type: Date,
    },

    duedate: {
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

    paymentID: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  },
);

rentSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `REN-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export const RentModel = mongoose.model("Rents", rentSchema);
