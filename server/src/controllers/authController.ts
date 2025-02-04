import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserSchema";
import { loginUser } from "../services/authServices";

import { Employee } from "../models/EmployeeSchema";

/**
 * User signup controller
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role = "employee" } = req.body; // Default role is 'employee'

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    // Hash password and save the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role, // Ensure the role is saved
    });
    await newUser.save();

    // Return response with user ID and role
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      role: newUser.role, // Return role for debugging
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

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const token = await loginUser(email, password);
    const user = await User.findOne({ email }).select(
      "name email role isActive"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 🔥 Fetch the corresponding Employee record
    const employee = await Employee.findOne({ email });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employeeId: employee ? employee._id : null, // ✅ Include employeeId
      },
    });
  } catch (error) {
    next(error);
  }
};
