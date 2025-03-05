import { Request, Response } from "express";
import { Department } from "../models/DepartmentSchema";
import { Employee } from "../models/EmployeeSchema";
import Attendance from "../models/AttendanceSchema";
import { User } from "../models/UserSchema";

interface IUser {
  _id: string;
  name: string;
  employeeId: string;
}

interface IEmployee {
  department: string;
  _id: string;
}

interface IAttendance {
  employeeId: IUser;
  checkIn: Date;
  checkOut: Date;
  status: string;
}

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
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server Error" });
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
    const { search, page = 1, limit = 10 } = req.query; // Default pagination settings

    // Apply search filter if provided
    const filter = search
      ? { departmentName: { $regex: search, $options: "i" } }
      : {};

    // Convert page and limit to numbers
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    // Fetch departments with pagination
    const [departments, totalDepartments] = await Promise.all([
      Department.find(filter)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
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
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server Error" });
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
    res.json({ totalDepartment });
  } catch (error) {
    console.error("Error fetching total departments:", error);
    res.status(500).json({
      message: "Error fetching total departments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTotalDepartmentEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Retrieve user ID from headers
    const userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // Extract the employeeId from the user
    const employeeId = user?.employeeId;
    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is missing" });
      return;
    }

    // Find employee to get department info
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: "Employee data not found" });
      return;
    }

    const departmentId = employee.department;
    if (!departmentId) {
      res.status(400).json({ message: "Department ID is missing" });
      return;
    }

    // Count employees in the department
    const totalEmployees = await Employee.countDocuments({
      department: departmentId,
    });

    // Respond with the total employees in the department
    res.status(200).json({ totalEmployees });
    return;
  } catch (error: any) {
    // Handle different types of errors without using a logger
    if (error.code === "ECONNRESET") {
      res.status(503).json({
        message: "Service unavailable. Please try again later.",
      });
      return;
    }

    // Handle database connection errors
    if (error.name === "MongoNetworkError") {
      res.status(500).json({
        message: "Database connection error. Please try again later.",
      });
      return;
    }

    // Generic error handling for other cases
    res.status(500).json({
      message: "Internal Server Error. Please try again later.",
    });
    return;
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
      console.log("User ID is missing from the request body.");
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Find the user details using userId
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const employee = await Employee.findById(user.employeeId);
    if (!employee) {
      res.status(404).json({ message: "Employee record not found" });
      return;
    }

    // Extract department ID
    const departmentId = employee.department;
    if (!departmentId) {
      res.status(400).json({ message: "Department not assigned" });
      return;
    }

    // Find all users in the same department
    const departmentUsers = await User.find({
      employeeId: {
        $in: await Employee.find({ department: departmentId }).distinct("_id"),
      },
    });

    // Get today's date with time set to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find unique present users for the day
    const uniquePresentUsers = await Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: departmentUsers.map((u) => u._id) },
          date: {
            $gte: today,
            $lt: tomorrow,
          },
          status: "Present",
        },
      },
      {
        $group: {
          _id: "$employeeId",
          checkIns: { $push: "$checkIn" },
          checkOuts: { $push: "$checkOut" },
        },
      },
    ]);

    // Fetch full user details for unique present users
    const presentUsersDetails = await User.populate(uniquePresentUsers, {
      path: "_id",
      populate: {
        path: "employeeId",
        model: "Employee",
      },
    });

    // Respond with department details and present users
    res.status(200).json({
      departmentId,
      totalPresent: uniquePresentUsers.length,
      presentUsers: presentUsersDetails.map((user) => {
        const employeeDetails = user._id as unknown as IUser;
        return {
          userId: employeeDetails._id,
          userName: employeeDetails.name,
          employeeDetails: employeeDetails.employeeId,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching today's department attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
