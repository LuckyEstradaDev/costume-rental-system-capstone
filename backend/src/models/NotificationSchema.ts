import mongoose from "mongoose";

export const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: ["pending", "active", "success", "cancelled", "refunded", "confirmed"],
    },
    orderReferenceId: {
      type: String,
      required: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    unread: {
      type: Boolean,
      default: true,
    },
  },
  {timestamps: true},
);