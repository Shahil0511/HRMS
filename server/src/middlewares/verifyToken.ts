import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/UserSchema";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Log the token to check its format (for debugging)
  console.log("Token received:", token);

  // Check if the token is missing
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - Token is required",
    });
    return;
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IUser;

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

    // Attach the decoded user to the request object for further processing
    (req as any).user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    // Handle specific errors, such as expired token
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token has expired",
      });
      return;
    }

    // Log the error for debugging purposes
    console.error("Token verification error:", error);

    // General invalid token error
    res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
    return;
  }
};
