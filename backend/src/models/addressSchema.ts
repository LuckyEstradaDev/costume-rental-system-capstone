import mongoose from "mongoose";

export const addressLevelSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {_id: false},
);

export const addressSchema = new mongoose.Schema(
  {
    region: {
      type: addressLevelSchema,
    },
    province: {
      type: addressLevelSchema,
    },
    cityMunicipality: {
      type: addressLevelSchema,
    },
    barangay: {
      type: addressLevelSchema,
    },
    street: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
  },
  {_id: false},
);
