import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserSchema";
import { loginUser } from "../services/authServices";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  role: "employee" | "admin";
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);

    // Decode the JWT token and type it using the DecodedToken interface
    const decodedToken = jwt.decode(token) as DecodedToken;

    res.status(200).json({
      message: "Login Successful",
      token,
      role: decodedToken.role,
    });
  } catch (error) {
    next(error);
  }
};
