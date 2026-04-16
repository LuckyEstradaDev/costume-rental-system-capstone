import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (process.env.NODE_ENV === "production" && uri.includes("localhost")) {
    throw new Error(
      "MONGODB_URI points to localhost in production. Use a hosted MongoDB URI instead.",
    );
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Connected to mongodb");
};
