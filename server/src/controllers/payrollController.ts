import { Request, Response } from "express";
import { Payroll } from "../models/PayrollSchema";
import { Employee } from "../models/EmployeeSchema";

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

export const fechEmployeeName = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    const name = `${employee.firstName} ${employee.lastName}`;
    res.status(200).json({ name });
  } catch (error) {
    console.error("Error fetching employee name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
