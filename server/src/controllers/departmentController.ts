import { Request, Response } from "express";
import { Department } from "../models/DepartmentSchema";
import { Employee } from "../models/EmployeeSchema";
import Attendance from "../models/AttendanceSchema";
import { User } from "../models/UserSchema";
import { Types } from "mongoose";

// Types
interface IUser {
  _id: string;
  name: string;
  employeeId: string;
}

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// Utility functions
const handleError = (
  res: Response,
  error: any,
  message = "Server Error",
  statusCode = 500
) => {
  console.error(`Error in department controller: ${message}`, error);

  // Handle specific error types
  if (error?.code === "ECONNRESET") {
    return res
      .status(503)
      .json({ message: "Service unavailable. Please try again later." });
  }

  if (error?.name === "MongoNetworkError") {
    return res
      .status(500)
      .json({ message: "Database connection error. Please try again later." });
  }

  res.status(statusCode).json({
    message,
    error: error instanceof Error ? error.message : "Unknown error",
  });
};

const getTodayDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { today, tomorrow };
};

/**
 * Helper function to handle duplicate department check
 */
const checkDuplicateDepartment = async (departmentName: string) => {
  return Department.findOne({ departmentName });
};

/**
 * Controller to create a new department.
 * Ensures no duplicate department names exist before creation.
 */
export const addDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentName, description, headOfDepartment } = req.body;

    if (!departmentName) {
      res.status(400).json({ message: "Department name is required" });
      return;
    }

    // Check if the department already exists (avoiding duplication)
    const existingDepartment = await checkDuplicateDepartment(departmentName);
    if (existingDepartment) {
      res.status(400).json({ message: "Department already exists" });
      return;
    }

    // Create and save the new department
    const newDepartment = await Department.create({
      departmentName,
      description,
      headOfDepartment,
    });

    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    handleError(res, error, "Error creating department");
  }
};

/**
 * Controller to retrieve all departments with optional search and pagination.
 */
export const getDepartments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

    // Apply search filter if provided
    const filter = search
      ? { departmentName: { $regex: search, $options: "i" } }
      : {};

    // Convert page and limit to numbers
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch departments with pagination - run in parallel
    const [departments, totalDepartments] = await Promise.all([
      Department.find(filter).skip(skip).limit(limitNumber).lean(),
      Department.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Departments retrieved successfully",
      departments,
      totalDepartments,
      totalPages: Math.ceil(totalDepartments / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    handleError(res, error, "Error fetching departments");
  }
};

/**
 * Controller to retrieve the total number of departments.
 */
export const getTotalDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalDepartment = await Department.countDocuments();
    res.status(200).json({ totalDepartment });
  } catch (error) {
    handleError(res, error, "Error fetching total departments");
  }
};

/**
 * Retrieves employee from user ID
 */
const getUserEmployee = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format");
  }

  const user = await User.findById(userId);
  if (!user || !user.employeeId) {
    throw new Error("User or employee ID not found");
  }

  const employee = await Employee.findById(user.employeeId);
  if (!employee || !employee.department) {
    throw new Error("Employee or department not found");
  }

  return { user, employee };
};

export const getTotalDepartmentEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Retrieve user ID from headers
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {
      const { employee } = await getUserEmployee(userId);

      // Count employees in the department
      const totalEmployees = await Employee.countDocuments({
        department: employee.department,
      });

      // Respond with the total employees in the department
      res.status(200).json({ totalEmployees });
    } catch (userError) {
      const message =
        userError instanceof Error ? userError.message : "User retrieval error";
      res.status(404).json({ message });
    }
  } catch (error) {
    handleError(res, error, "Error counting department employees");
  }
};

export const getTodayTotalDepartmentPresent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract userId from the request body
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {
      const { employee } = await getUserEmployee(userId);
      const departmentId = employee.department;

      // Find all users in the same department - query optimization
      const departmentEmployeeIds = await Employee.find({
        department: departmentId,
      }).distinct("_id");

      const departmentUserIds = await User.find({
        employeeId: { $in: departmentEmployeeIds },
      }).distinct("_id");

      // Get today's date range
      const { today, tomorrow } = getTodayDateRange();

      // Find unique present users for the day - optimized aggregation
      const uniquePresentUsers = await Attendance.aggregate([
        {
          $match: {
            employeeId: {
              $in: departmentUserIds.map((id) =>
                typeof id === "string" ? new Types.ObjectId(id) : id
              ),
            },
            date: { $gte: today, $lt: tomorrow },
            status: "Present",
          },
        },
        {
          $group: {
            _id: "$employeeId",
          },
        },
        {
          $count: "totalPresent",
        },
      ]);

      // Respond with department details and present users
      res.status(200).json({
        totalPresent:
          uniquePresentUsers.length > 0
            ? uniquePresentUsers[0].totalPresent
            : 0,
      });
    } catch (userError) {
      const message =
        userError instanceof Error ? userError.message : "User retrieval error";
      res.status(404).json({ message });
    }
  } catch (error) {
    handleError(res, error, "Error fetching today's department attendance");
  }
};
