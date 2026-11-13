
import mongoose, { Schema, Model } from "mongoose"
import type { IOTPVerification } from "./../interfaces/IOTPVerification.js";

const OTPVerificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    otpHash: {
      type: String,
      required: true
    },

    purpose: {
      type: String,
      enum: [
        "ACCOUNT_VERIFICATION",
        "PASSWORD_RESET",
        "EMAIL_CHANGE"
      ],
      required: true
    },

    status: {
      type: String,
      enum: [
        "PENDING",,
        "EXPIRED",
        "USED",
        "INVALIDATED"
      ],
      default: "PENDING"
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Automatically delete expired records after expiration.
// MongoDB TTL deletion is not immediate.
OTPVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export const OTPModel: Model<IOTPVerification> = mongoose.model<IOTPVerification>(
  "OTPVerification",
  OTPVerificationSchema
);