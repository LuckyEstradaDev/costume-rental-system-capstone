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
          type: mongoose.Schema.Types.ObjectId,
          ref: "Outfits",
          required: true,
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
