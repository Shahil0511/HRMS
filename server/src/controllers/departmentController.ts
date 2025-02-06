import { Request, Response } from "express";
import { Department } from "../models/DepartmentSchema";

/**
 * Create a new department
 */
export const addDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentName, description, headOfDepartment } = req.body;

    const existingDepartment = await Department.findOne({ departmentName });
    if (existingDepartment) {
      res.status(400).json({ message: "Department already exists" });
      return;
    }

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
 * Get all departments with optional search filter and pagination
 */
export const getDepartments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query; // Set default pagination

    const filter = search
      ? { departmentName: { $regex: search, $options: "i" } }
      : {};

    // Convert page and limit to numbers
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Fetch departments with pagination
    const departments = await Department.find(filter)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const totalDepartments = await Department.countDocuments(filter);

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
