import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/db";
import authRoutes from "./routes/auth";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

const startServer = async () => {
  try {
    connectDb();

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
