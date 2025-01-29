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
  // Extract Bearer token
  const token = req.headers.authorization?.split(" ")[1]?.trim();

  if (!token) {
    res.status(401).json({ message: "Authorization token is required" });
    return;
  }

  try {
    // Verify JWT Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as DecodedUser;

    const userId = decoded.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const user = await User.findById(userId).select("role");

    if (!user) {
      res.status(403).json({ message: "Access denied. User not found." });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
