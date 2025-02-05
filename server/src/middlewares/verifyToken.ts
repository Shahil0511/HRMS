import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/UserSchema";

export interface RequestWithUser extends Request {
  user?: IUser; // Make user optional as it’s set by middleware
}

export const verifyToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token is required",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IUser;

    if (!decoded || !decoded.employeeId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token structure",
      });
      return;
    }

    // Attach the decoded user to req.user
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token has expired",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
    return;
  }
};
