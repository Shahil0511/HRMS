import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/db";
import authRoutes from "./routes/auth";
import departmentRoutes from "./routes/department";
import employeeRoutes from "./routes/employee";

import cors from "cors";
import multer from "multer";
const upload = multer();

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.1.7:5173"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(upload.none());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/", departmentRoutes);
app.use("/api/", employeeRoutes);

// Start server
const startServer = async () => {
  try {
    await connectDb();

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
