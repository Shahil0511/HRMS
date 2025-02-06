// src/controllers/employeeController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/UserSchema";
import { Employee } from "../models/EmployeeSchema";
import crypto from "crypto";

interface RequestWithUser extends Request {
  user?: any;
}

/**
 * Add a new employee and automatically create the corresponding user with a hashed password
 */
// Backend: Corrected addEmployee function

export const addEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dob,
      phoneNumber,
      email,
      address,
      department,
      designation,
    } = req.body;

    // Validating that all required fields are provided
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !dob ||
      !phoneNumber ||
      !email ||
      !address ||
      !department ||
      !designation
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Create new employee instance
    const newEmployee = new Employee({
      firstName,
      lastName,
      gender,
      dob,
      phoneNumber,
      email,
      address,
      department,
      designation,
    });

    // Saving employee to the database
    const savedEmployee = await newEmployee.save();

    // Generate a secure password for the employee user
    const generateSecurePassword = (): string => {
      return crypto.randomBytes(8).toString("hex"); // 8-byte random password
    };

    const rawPassword = generateSecurePassword(); // Generate a random password

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create a new user instance with the hashed password
    const newUser = new User({
      name: `${firstName} ${lastName}`, // Full name from first and last name
      email: email, // Use the employee's email
      password: hashedPassword, // Hashed password
      role: "employee", // Default to employee role
      isActive: true, // Assuming the user is active by default
      employeeId: savedEmployee._id, // Link the employee to the user
    });

    // Save the user to the database
    await newUser.save();

    // Returning success response with the saved employee and user details
    res.status(201).json({
      success: true,
      message: "Employee and user added successfully",
      employee: savedEmployee,
      user: newUser,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: "Failed to add employee and user",
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to add employee and user",
        error: "An unknown error occurred",
      });
    }
  }
};

/**
 * Get all employees
 */
export const getEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Query the database for all employees
    const employees = await Employee.find();

    // Returning success response with employee list
    res.status(200).json({
      success: true,
      employees,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: "An unknown error occurred",
      });
    }
  }
};

/**
 * Get the current authenticated user's employee data
 */
export const getUserEmployeeData = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    // Ensure req.user exists and has an id (not _id)
    if (!req.user || !req.user.id) {
      res.status(403).json({ message: "Access denied. User not found." });
    }

    const user = await User.findById(req.user.id).select("name email role");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Respond with the user data (no employee data is fetched)
    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: "An unknown error occurred",
    });
  }
};
