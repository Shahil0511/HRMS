import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/UserSchema";
import { Request, Response } from "express";
import mongoose from "mongoose";

// Custom error class for better error tracking
class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

/**
 * Interface for token payload
 */
interface TokenPayload {
  id: string;
  role: string;
}

/**
 * Generates a JWT token
 * @param payload - The payload to encode
 * @returns Signed JWT token
 */
const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

/**
 * Authenticates a user and returns a JWT token
 * @param email - User email
 * @param password - User password
 * @returns JWT token
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  try {
    // Validate email and password inputs
    if (!email || !password) {
      throw new AuthError("Email and password are required", 400);
    }

    // Find the user by email and select relevant fields
    const user = await User.findOne({ email }).select(
      "password role employeeId"
    );

    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Safely access _id and convert it to string
    const userId = user._id.toString();

    // Generate and return JWT token
    return generateToken({ id: userId, role: user.role });
  } catch (error: any) {
    throw error; // Re-throw the error for further handling
  }
};

/**
 * Middleware to handle authentication errors
 */
export const authErrorHandler = (
  err: any,
  req: Request,
  res: Response
): void => {
  const status = err.statusCode || 500; // Use the status code from AuthError or fallback to 500
  const message = err.message || "Internal Server Error"; // Error message from AuthError or default
  res.status(status).json({ success: false, message });
};
