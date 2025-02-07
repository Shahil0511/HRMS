import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/UserSchema";

// Extend the Request interface to include the user
export interface RequestWithUser extends Request {
  user?: IUser;
}

export const verifyToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // If no token is found, reject the request
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token is required",
      });
      return;
    }

    // Decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IUser;

    // Check if the decoded token contains the necessary fields (id and role)
    if (!decoded || !decoded.id || !decoded.role) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token structure",
      });
      return;
    }

    // Attach the decoded user to the request object for later use
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    console.error("Error during token verification:", error);

    // If the token has expired, send a specific error message
    if (error.name === "TokenExpiredError") {
      console.log("Token expired");
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token has expired",
      });
    }

    // For any other errors, send a generic invalid token error message
    else {
      console.log("Invalid token");
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }
  }
};
