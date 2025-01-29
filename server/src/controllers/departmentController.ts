import { Request, Response } from "express";
import { Department } from "../models/DepartmentSchema";

// @desc    Create a new department
// @route   POST /api/departments
// @access  Admin Only
export const addDepartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentName, description, headOfDepartment } = req.body;

    // Check if department already exists
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
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all departments with optional search filter
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search } = req.query; // Get the search query from the request

    let filter = {};
    if (search) {
      // If search query is present, filter by departmentName
      filter = { departmentName: { $regex: search, $options: "i" } }; // Case-insensitive regex search
    }

    const departments = await Department.find(filter).lean();

    res.status(200).json({
      message: "Departments retrieved successfully",
      departments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
