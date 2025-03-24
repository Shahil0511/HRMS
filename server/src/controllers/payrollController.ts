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
