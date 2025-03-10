import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { IUser, User } from "../models/UserSchema";
import { Employee, IEmployee } from "../models/EmployeeSchema";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

interface RequestWithUser extends Request {
  user?: any;
}

/**
 * Controller to add a new employee.
 * Automatically creates a corresponding user with a generated password.
 */
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

    // Validate that all required fields are provided
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

    // Generate a default password based on the employee's first name and phone number
    const generatePassword = (
      firstName: string,
      phoneNumber: string
    ): string => {
      const last4Digits = phoneNumber.slice(-4); // Extract last 4 digits of phone number
      return `${firstName}@${last4Digits}`; // Format: firstName@last4digits
    };

    const rawPassword = generatePassword(firstName, phoneNumber);

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create a new employee instance
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

    // Save the employee record to the database
    const savedEmployee = await newEmployee.save();

    // Create a new user instance linked to the employee
    const newUser = new User({
      name: `${firstName} ${lastName}`, // Full name
      email,
      password: hashedPassword, // Store hashed password
      role: "employee", // Default role
      isActive: true, // User is active by default
      employeeId: savedEmployee._id, // Link employee record
    });

    // Save the user record to the database
    await newUser.save();

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
 * Controller to fetch all employees.
 */
export const getEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Retrieve all employees from the database
    const employees = await Employee.find();

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
 * Controller to retrieve the authenticated user's employee data.
 */
export const getUserEmployeeData = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    // Ensure the request contains a valid authenticated user
    if (!req.user || !req.user.id) {
      res.status(403).json({ message: "Access denied. User not found." });
      return;
    }

    // Fetch user details
    const user = await User.findById(req.user.id).select("name email role");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Respond with the user details
    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: "An unknown error occurred",
    });
  }
};

export const getTotalEmployees = async (req: Request, res: Response) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    res.json({ totalEmployees });
  } catch (error: any) {
    res.status(500).json({
      message: "Error in Fetching TotalEmployee",
      error: error.message,
    });
  }
};

/**
 * @desc    Get Employee by ID
 * @route   GET /api/employees/:id
 * @access  Private (Depends on authentication middleware)
 */
export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid Employee ID" });
      return;
    }

    // ✅ Fetch employee data (excluding sensitive fields if needed)
    const employee = await Employee.findById(id)
      .populate("department", "departmentName headOfDepartment")
      .lean(); // Using `.lean()` for better performance

    // ✅ If employee not found
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }

    // ✅ Return Employee Data
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("🔴 Error fetching employee:", error);
    res.status(500).json({ success: false, message: "Server Error" });
    return;
  }
};

export const getEmployeeProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Token is required",
      });
      return;
    }

    // Manually decode the token here
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IUser;

    if (!decoded || !decoded.id || !decoded.role) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token structure",
      });
      return;
    }

    const userId = decoded.id; // Using decoded.id from the token

    // Find user based on userId and get employeeId from the user
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const employeeId = user.employeeId; // Get employeeId from the user document

    // Fetch employee data based on the employeeId
    const employee = await Employee.findOne({
      _id: new mongoose.Types.ObjectId(employeeId),
    })
      .populate("department", "departmentName headOfDepartment")
      .lean(); // Using lean for performance

    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    console.error("🔴 Error fetching employee profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getEmployeeDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    // Fetch employee details and populate department name
    const employee = await Employee.findOne({ _id: employeeId }).populate<{
      department: { departmentName: string };
    }>("department", "departmentName");

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    const department = employee.department;
    const designation = employee.designation;

    const departmentName = department.departmentName;

    // Send only department and designation
    res.status(200).json({
      departmentName,
      designation,
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEmployeesByDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role, userId, email, employeeId } = req.body;

    if (!role || !userId || !email || !employeeId) {
      console.error("Missing required fields in request body.");
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Convert employeeId to ObjectId if necessary
    const employee = await Employee.findById(
      new mongoose.Types.ObjectId(employeeId)
    );

    if (!employee) {
      console.error(`Employee with _id ${employeeId} not found.`);
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    if (!employee.department) {
      console.error(`Employee ${employeeId} has no department assigned.`);
      res.status(400).json({ message: "Employee has no department assigned" });
      return;
    }

    const employees = await Employee.find({ department: employee.department });

    res.status(200).json({ employees });
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    res.status(500).json({ message: "Server error" });
  }
};
