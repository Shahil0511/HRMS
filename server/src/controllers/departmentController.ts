import { Request, Response } from "express";
import { Department } from "../models/DepartmentSchema";
import mongoose from "mongoose";

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

    // Check if the department already exists
    const existingDepartment = await Department.findOne({ departmentName });
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
 * Controller to retrieve all departments.
 * Supports optional search queries and pagination.
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
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Fetch departments with pagination
    const departments = await Department.find(filter)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    // Get the total count of departments matching the filter
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

export const getTotalDepartment = async (req: Request, res: Response) => {
  try {
    const totalDepartment = await Department.countDocuments();
    res.json({ totalDepartment });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error in Fetching Departments", error: error.message });
  }
};

// export const getDepartmentById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;

//     // ✅ Validate MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       res
//         .status(400)
//         .json({ success: false, message: "Invalid Department ID" });
//       return;
//     }

//     // ✅ Fetch department data
//     const department = await Department.findById(id).lean(); // Using `.lean()` for better performance

//     // ✅ If department not found
//     if (!department) {
//       res.status(404).json({ success: false, message: "Department not found" });
//       return;
//     }

//     // ✅ Return Department Data
//     res.status(200).json({
//       success: true, // Added success field for consistency
//       data: department,
//     });
//   } catch (error) {
//     console.error("🔴 Error fetching department:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
