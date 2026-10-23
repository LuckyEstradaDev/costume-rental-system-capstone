import mongoose from "mongoose";
import {addressSchema} from "./addressSchema.js";
import { notificationSchema } from "./NotificationSchema.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },

    lastName: {
      type: String,
      trim: true,
      required: true,
    },

    middleName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    profilePicture: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    hashedPassword: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    address: {
      type: addressSchema,
      default: undefined,
    },

    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },

    notifications: {
      type: [notificationSchema]
    }
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model("Users", userSchema);
