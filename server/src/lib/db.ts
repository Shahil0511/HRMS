import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("DataBase Connected Successfully!!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
