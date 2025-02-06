import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserSchema";
import { loginUser } from "../services/authServices";

import { Employee } from "../models/EmployeeSchema";
import mongoose from "mongoose";

/**
 * User signup controller
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    email,
    password,
    role = "employee",
    department,
    designation,
  } = req.body;

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
      role,
    });
    await newUser.save();

    // Create the Employee record and link it to the User
    const newEmployee = new Employee({
      firstName: name.split(" ")[0], // Assuming first name is the first part of the full name
      lastName: name.split(" ")[1] || "",
      email,
      department,
      designation,
    });
    await newEmployee.save();

    // Update the User model with employeeId reference
    newUser.employeeId = newEmployee._id as mongoose.Types.ObjectId;
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      role: newUser.role,
      employeeId: newEmployee._id,
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
      "name email role isActive employeeId"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Fetch the corresponding Employee record using the employeeId
    const employee = user.employeeId
      ? await Employee.findById(user.employeeId)
      : null;

    // 🛠 Debugging Logs to check data before responding

    // 🛠 Check if role is undefined
    if (!user.role) {
      console.error("❌ ERROR: User role is missing in database");
    }

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role || "unknown", // 🔥 Ensure role is not undefined
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "unknown", // 🔥 Ensure role is present
        isActive: user.isActive,
        employeeId: employee ? employee._id : null,
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    next(error);
  }
};
