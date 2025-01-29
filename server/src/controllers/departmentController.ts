import { Request, RequestHandler, Response } from "express";
import { Department } from "../models/DepartmentSchema";

// @desc    Create a new department
// @route   POST /api/departments
// @access  Admin Only
export const addDepartment: RequestHandler = async (
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

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await Department.find().lean();

    res.status(200).json({
      message: "Departments retrieved successfully",
      departments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
