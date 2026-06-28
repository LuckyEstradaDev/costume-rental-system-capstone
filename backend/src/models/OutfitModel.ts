import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema(
  {
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

            width_cm: {type: Number, required: true},
            height_cm: {type: Number, required: true},
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

export const OutfitModel = mongoose.model("Outfits", outfitSchema);
