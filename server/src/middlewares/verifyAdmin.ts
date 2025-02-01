import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { IUser, User } from "../models/UserSchema";

interface DecodedUser {
  id: string;
  role: string;
}

export const isAdmin = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Get the token

  if (!token) {
    res.status(401).json({ message: "Authorization token is required" });
    return;
  }

  try {
    // Verify token and decode the user
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as DecodedUser;

    const userId = decoded.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    // Check if the user exists
    const user = await User.findById(userId).select("role");

    if (!user) {
      res.status(403).json({ message: "Access denied. User not found." });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    // Attach the user to the request object for further use
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
