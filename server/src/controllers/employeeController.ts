import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { IUser, User } from "../models/UserSchema";
import { Employee, IEmployee } from "../models/EmployeeSchema";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Attendance from "../models/AttendanceSchema";

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    // Generate a more secure password with additional entropy
    const generatePassword = (): string => {
      const randomString = Math.random().toString(36).substring(2, 10);
      return `${firstName.substring(0, 3)}${randomString}${phoneNumber.slice(
        -2
      )}`;
    };

    const rawPassword = generatePassword();

    // Hash the generated password with higher complexity
    const salt = await bcrypt.genSalt(12); // Increased from 10 to 12
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Create a new employee instance
    const newEmployee = new Employee({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dob,
      phoneNumber,
      email: email.toLowerCase().trim(),
      address,
      department,
      designation,
    });

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save the employee record to the database
      const savedEmployee = await newEmployee.save({ session });

      // Create a new user instance linked to the employee
      const newUser = new User({
        name: `${firstName.trim()} ${lastName.trim()}`, // Full name
        email: email.toLowerCase().trim(),
        password: hashedPassword, // Store hashed password
        role: "employee", // Default role
        isActive: true, // User is active by default
        employeeId: savedEmployee._id, // Link employee record
      });

      // Save the user record to the database
      await newUser.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Don't return the password in the response
      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };

      res.status(201).json({
        success: true,
        message: "Employee and user added successfully",
        employee: savedEmployee,
        user: userResponse,
        tempPassword: rawPassword, // Include the temporary password in the response so it can be shared with the employee
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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
    // Use projection to exclude unnecessary fields
    const employees = await Employee.find().select("-__v").lean();

    res.status(200).json({
      success: true,
      count: employees.length,
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
      res.status(403).json({
        success: false,
        message: "Access denied. User not found.",
      });
      return;
    }

    // Fetch user details with projection to limit returned fields
    const user = await User.findById(req.user.id)
      .select("name email role")
      .lean();

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
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const getTotalEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalEmployees = await Employee.countDocuments();
    res.status(200).json({
      success: true,
      totalEmployees,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
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

    // ✅ Fetch employee data with proper projection
    const employee = await Employee.findById(id)
      .select("-__v")
      .populate("department", "departmentName headOfDepartment -_id")
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
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getEmployeeProfile = async (
  req: RequestWithUser,
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

    // Use try-catch specifically for token verification
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as IUser;
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
      return;
    }

    if (!decoded || !decoded.id || !decoded.role) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token structure",
      });
      return;
    }

    const userId = decoded.id;

    // Use projection to limit returned fields
    const user = await User.findById(userId).select("employeeId").lean();

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const employeeId = user.employeeId;

    // Fetch employee data with proper projection
    const employee = await Employee.findById(employeeId)
      .select("-__v")
      .populate("department", "departmentName headOfDepartment -_id")
      .lean();

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
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({
        success: false,
        message: "Invalid Employee ID format",
      });
      return;
    }

    // Fetch only the department field
    const employee = await Employee.findById(employeeId)
      .select("department")
      .lean();

    if (!employee) {
      console.error(`Employee with _id ${employeeId} not found.`);
      res.status(404).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    if (!employee.department) {
      console.error(`Employee ${employeeId} has no department assigned.`);
      res.status(400).json({
        success: false,
        message: "Employee has no department assigned",
      });
      return;
    }

    // Fetch employees with projection to limit returned fields
    const employees = await Employee.find({ department: employee.department })
      .select("firstName lastName email designation")
      .lean();

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees by department:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUserByAttendanceId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { attendanceId } = req.params;

    let response;
    let status = 200;

    if (!attendanceId || !mongoose.Types.ObjectId.isValid(attendanceId)) {
      response = { success: false, message: "Invalid Attendance ID" };
      status = 400;
    } else {
      const attendance = await Attendance.findById(attendanceId);
      if (!attendance) {
        response = { success: false, message: "Attendance not found" };
        status = 404;
      } else {
        const user = await User.findOne({ _id: attendance.employeeId }).select(
          "-password -refreshToken"
        );
        response = user
          ? { success: true, data: user }
          : {
              success: false,
              message: "User not found",
              employeeId: attendance.employeeId,
            };
        status = user ? 200 : 404;
      }
    }

    res.status(status).json(response);
  } catch (error: any) {
    const errorResponse = {
      success: false,
      message: "Server error",
      error: error.message,
    };
    res.status(500).json(errorResponse);
  }
};
