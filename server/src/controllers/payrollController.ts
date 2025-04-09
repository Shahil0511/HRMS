import { Request, Response } from "express";
import { Payroll } from "../models/PayrollSchema";
import { Employee } from "../models/EmployeeSchema";
import mongoose from "mongoose";

import Attendance from "../models/AttendanceSchema";
import { User } from "../models/UserSchema";

// Controller to get payroll data for an employee
export const getPayroll = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract employeeId from the request body
    const { employeeId } = req.body;

    // Validate employeeId
    if (!employeeId) {
      res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
      return;
    }

    // Fetch employee data by employeeId
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    // Fetch the associated payroll data for the employee
    const payrollId = employee.payroll;
    const payroll = await Payroll.findById(payrollId);
    if (!payroll) {
      res.status(404).json({
        success: false,
        message: "Payroll data not found for this employee",
      });
      return;
    }

    // Respond with the payroll data
    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error: any) {
    // General error handling
    console.error("Error fetching payroll data:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

//Admin all in one

export const getTotalSalary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch total salary for all employees
    const totalSalaryResult = await Payroll.aggregate([
      { $group: { _id: null, totalSalary: { $sum: "$baseSalary" } } },
    ]);

    // Fetch total salary per department with department names
    const departmentSalary = await Payroll.aggregate([
      {
        $group: {
          _id: "$department", // Use department ObjectId from Payroll
          departmentTotal: { $sum: "$baseSalary" },
        },
      },
      {
        $lookup: {
          from: "departments", // Ensure this is the correct collection name
          localField: "_id", // department ObjectId from Payroll
          foreignField: "_id", // _id in Departments collection
          as: "departmentDetails",
        },
      },
      {
        $unwind: {
          path: "$departmentDetails", // Ensure there's a departmentDetails object
          preserveNullAndEmptyArrays: true, // If no department data, still include the record
        },
      },
      {
        $project: {
          _id: 1,
          departmentName: "$departmentDetails.departmentName", // Fetch department name
          departmentTotal: 1, // Fetch the department's total salary
        },
      },
    ]);

    const totalSalary = totalSalaryResult[0]?.totalSalary || 0;

    // Return the response
    res.status(200).json({
      totalSalary,
      departmentSalary, // Returns department name and salary
    });
  } catch (error) {
    console.error("Error fetching salary data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayrollAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate Employee ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid employee ID format" });
      return;
    }

    // 1. Fetch the employee by ID
    const employee = await Employee.findById(id).populate("workReports").lean();

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // 2. Find the linked User using employeeId field
    const user = await User.findOne({ employeeId: id }).lean();

    if (!user) {
      res.status(404).json({ message: "User not found for this employee" });
      return;
    }

    // 3. Use user._id to fetch attendance
    const attendance = await Attendance.find({ employeeId: user._id }).lean();

    // 4. Get payroll (assuming one-to-one)
    const payroll = await Payroll.findOne({ employee: id }).lean();

    // 5. Construct response
    const responseData = {
      name: `${employee.firstName} ${employee.lastName}`,
      salary: payroll?.baseSalary || 0,
      workReports: employee.workReports || [],
      attendance: attendance || [],
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
