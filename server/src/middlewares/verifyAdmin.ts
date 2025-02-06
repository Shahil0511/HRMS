import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IUser, User } from "../models/UserSchema";

export interface RequestWithUser extends Request {
  user?: IUser;
}

export const isAdmin = async (
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

    const userId = req.user.id; // Use id from JWT payload

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    // Check if the user exists and has an "admin" role
    const user = await User.findById(userId).select("role");

    if (!user) {
      res.status(403).json({ message: "Access denied. User not found." });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Error verifying admin status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
