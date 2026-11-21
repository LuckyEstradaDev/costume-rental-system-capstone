import mongoose, {Schema} from "mongoose";
import {nanoid} from "nanoid";

const reservationSchema = new mongoose.Schema(
  {
    requested: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      min: 0,
    },
    method: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "none",
        "pending",
        "paid",
        "failed",
        "expired",
        "refunded",
        "forfeited",
      ],
      default: "none",
    },
    deadlineAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    refundableUntil: {
      type: Date,
    },
    paymentIntentId: {
      type: String,
    },
    stockDeducted: {
      type: Boolean,
      default: false,
    },
  },
  {_id: false},
);

export const paymentSchema = new mongoose.Schema(
  {
    referenceID: {
      type: String,
      unique: true,
      required: true,
    },

    orderID: {
      // it is orderID but it can also be rents
      type: Schema.Types.ObjectId,
    },
    method: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
    },
    cash: {
      type: Number,
      min: 0,
    },
    change: {
      type: Number,
      min: 0,
    },
    paidAt: {
      type: Date,
    },

    paymentIntentId: {
      type: String,
    },
    reservation: {
      type: reservationSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `PAY-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export const PaymentModel = mongoose.model("Payment", paymentSchema);
