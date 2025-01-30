import { Request, Response } from "express";
import { IEmployee, Employee } from "../models/EmployeeSchema";

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
