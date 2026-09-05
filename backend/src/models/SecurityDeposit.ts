import mongoose from "mongoose";

export const securityDepositSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Cash", "Government ID", "Non-Government ID", "Other"],
    required: true,
  },
  IDType: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Held", "Returned", "Forfeited"],
    default: "Pending",
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
  },
  amount: {
    //only available for Cash type
    type: Number,
  },
  dateSurrendered: {
    type: Date,
  },
  dateReturned: {
    type: Date,
  },
});
