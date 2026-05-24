import mongoose, {Schema} from "mongoose";

const paymentSchema = new mongoose.Schema({
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
});

export const PaymentModel = mongoose.model("Payment", paymentSchema);
