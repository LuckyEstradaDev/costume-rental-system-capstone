import mongoose, {Schema} from "mongoose";

const rentSchema = new mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    rentedItems: {
      type: [String],
      required: true,
    },
    rentStart: {
      type: Date,
      required: true,
    },
    rentEnd: {
      type: Date,
      required: true,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    returnTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "overdue", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export const RentModel = mongoose.model("Rents", rentSchema);
