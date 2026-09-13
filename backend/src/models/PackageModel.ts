import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageURL: {
      type: [String],
      required: true,
    },
    items: {
      type: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Items",
            required: true,
          },
          minimumQuantity: {
            // used if the package has a set minimum quantity for the item.
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    mode: {
      type: String,
      enum: ["rental", "purchase", "both"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Packages", packageSchema);
