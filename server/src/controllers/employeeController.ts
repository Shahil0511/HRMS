import { Request, Response } from "express";
import { IEmployee, Employee } from "../models/EmployeeSchema";
import jwt from "jsonwebtoken";
import { User } from "../models/UserSchema";

/**
 * Add a new employee
 */
export const addEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Destructuring required fields from the request body
    const {
      firstName,
      lastName,
      gender,
      dob,
      phoneNumber,
      email,
      address,
      department, // Ensure department is an ObjectId or valid reference
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
      return; // Ensure function doesn't continue if validation fails
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
      department, // Department is passed directly; should be a valid ObjectId from Department model
      designation,
    });

    // Saving employee to the database
    const savedEmployee = await newEmployee.save();

    // Returning success response with the saved employee details
    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: savedEmployee,
    });
  } catch (error: unknown) {
    // Enhanced error handling
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: "Failed to add employee",
        error: error.message, // Safely accessing error message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to add employee",
        error: "An unknown error occurred", // Fallback error message
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
    const employees: IEmployee[] = await Employee.find();

    // Returning success response with employee list
    res.status(200).json({
      success: true,
      employees,
    });
  } catch (error: unknown) {
    // Enhanced error handling for fetching employees
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
        error: "An unknown error occurred", // Fallback error message
      });
    }
  }
};

/**
 * Get the current authenticated employee's data
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
      return;
    }

    // Verify the token and extract the user ID
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.id;

    const user = await User.findById(userId).select("name email role isActive"); // Select relevant fields (no firstName, lastName)

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: "An unknown error occurred",
      });
    }
  }
};
