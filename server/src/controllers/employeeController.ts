import { Request, Response } from "express";
import { IEmployee, Employee } from "../models/EmployeeSchema";
import jwt from "jsonwebtoken";
import { User } from "../models/UserSchema";

/**
 * Add a new employee
 */
import bcrypt from "bcryptjs";

/**
 * Add a new employee and automatically create the corresponding user with a hashed password
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

    // Generate password from first characters of first and last name, and last 5 digits of phone number
    const generatePassword = (
      firstName: string,
      lastName: string,
      phoneNumber: string
    ): string => {
      const firstCharFirstName = firstName.charAt(0).toLowerCase(); // First character of first name
      const firstCharLastName = lastName.charAt(0).toLowerCase(); // First character of last name
      const last5PhoneNumber = phoneNumber.slice(-5); // Last 5 digits of phone number
      return `${firstCharFirstName}${firstCharLastName}@${last5PhoneNumber}`;
    };

    const rawPassword = generatePassword(firstName, lastName, phoneNumber);

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create a new user instance with the hashed password
    const newUser = new User({
      name: `${firstName} ${lastName}`, // Full name from first and last name
      email: email, // Use the employee's email
      password: hashedPassword, // Hashed password
      role: "employee", // Default to employee role
      isActive: true, // Assuming the user is active by default
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
