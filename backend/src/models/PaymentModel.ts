import mongoose, {Schema} from "mongoose";
import {nanoid} from "nanoid";

const paymentSchema = new mongoose.Schema({
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
    enum: ["pending", "paid", "refunded", "failed"],
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
}, {
  timestamps: true,
});

paymentSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `PAY-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export const PaymentModel = mongoose.model("Payment", paymentSchema);
