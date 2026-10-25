import mongoose from "mongoose";
import {nanoid} from "nanoid";

const packageSchema = new mongoose.Schema(
  {
    referenceID: {
      type: String,
      unique: true,
      sparse: true,
      immutable: true,
    },
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
          rentalPackagePrice: {
            type: Number,
            min: 0,
          },
          purchasePackagePrice: {
            type: Number,
            min: 0,
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

packageSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `PKG-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export default mongoose.model("Packages", packageSchema);
