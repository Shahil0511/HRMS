import { Request, Response } from "express";
import { Department } from "../models/DepartmentSchema";

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
