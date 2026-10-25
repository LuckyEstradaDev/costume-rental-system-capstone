import mongoose from "mongoose";
import {nanoid} from "nanoid";

export const outfitSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fabricType: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
    },
    modelURL: {
      type: String,
    },
    variants: [
      {
        color: {type: String, required: true},
        sizes: [
          {
            _id: false,
            size: {type: String, required: true},
            stock: {type: Number, required: true, default: 0},

            measurements: {
              chest: {
                type: Number,
                min: 0,
              },

              bust: {
                type: Number,
                min: 0,
              },

              waist: {
                type: Number,
                min: 0,
              },

              hips: {
                type: Number,
                min: 0,
              },

              shoulder: {
                type: Number,
                min: 0,
              },

              sleeveLength: {
                type: Number,
                min: 0,
              },

              neck: {
                type: Number,
                min: 0,
              },

              inseam: {
                type: Number,
                min: 0,
              },

              outfitLength: {
                type: Number,
                min: 0,
              },
            },

            width_cm: {type: Number, required: false},
            height_cm: {type: Number, required: false},
          },
        ],
      },
    ],
    price: {
      type: Number,
    },
    rentalPrice: {
      type: Number,
    },
    // outfitsSold: {
    //   type: Number,
    // },
    // outfits_rented: {
    //   type: Number,
    // },
  },
  {
    timestamps: true,
  },
);

outfitSchema.pre("validate", function () {
  if (!this.referenceID) {
    const year = new Date().getFullYear();

    this.referenceID = `OUT-${year}-${nanoid(6).toUpperCase()}`;
  }
});

export const OutfitModel = mongoose.model("Outfits", outfitSchema);
