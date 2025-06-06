import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../models/UserSchema";
import { RequestWithUser } from "./verifyAdmin";

export const isEmployee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure the user object is available from the `verifyToken` middleware
    if (!req.user || !req.user.id) {
      res.status(403).json({ message: "Access denied. User not found." });
      return;
    }

    const userId = req.user.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    // Check if the user exists and has a "manager" role
    const user = await User.findById(userId).select("role");

    if (!user) {
      res.status(403).json({ message: "Access denied. User not found." });
      return;
    }

    if (user.role !== "employee") {
      res.status(403).json({ message: "Access denied. employee only." });
      return;
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Error verifying employee status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
