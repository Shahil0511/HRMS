import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserSchema";
import { loginUser } from "../services/authServices";
import jwt from "jsonwebtoken";

/**
 * User signup controller
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    // Hash password and save the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Return response with user ID
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * User login controller
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Attempt to login and return token
    const token = await loginUser(email, password);

    // Decode token for the user info (optional: if you want to return the user role here)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    const user = await User.findById(decodedToken.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // Respond with the token and role
    res.status(200).json({
      message: "Login Successful",
      token,
      user,
      role: decodedToken.role,
    });
  } catch (error) {
    next(error);
  }
};
