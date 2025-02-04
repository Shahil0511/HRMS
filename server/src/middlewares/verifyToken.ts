import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/UserSchema";

// Extend the Request interface to include the user object
interface RequestWithUser extends Request {
  user?: IUser;
}

export const verifyToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Log the token for debugging
    console.log("Token received:", token);

    // Check if the token is missing
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token is required",
      });
      return;
    }

    // Verify the token and decode the payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IUser;

    // Log the decoded token for debugging
    console.log("Decoded Token:", decoded);

    // Ensure the decoded token contains the expected structure
    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token structure",
      });
      return;
    }

    // Attach the decoded user to the request object
    req.user = decoded;

    // Proceed to the next middleware
    next();
  } catch (error: any) {
    console.error("Token verification error:", error);

    // Handle expired token
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token has expired",
      });
      return;
    }

    // Handle general invalid token error
    res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
    return;
  }
};
