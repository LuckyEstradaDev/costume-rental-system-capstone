import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to mongodb");
  } catch (error) {
    console.error("Error message: ", error);
  }
};
