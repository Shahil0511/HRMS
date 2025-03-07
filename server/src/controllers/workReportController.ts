import { Request, Response } from "express";

import { Employee } from "../models/EmployeeSchema";
import { WorkReport } from "../models/WorkReportSchema";
import mongoose from "mongoose";
import { Department } from "../models/DepartmentSchema";

export const submitWorkReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Destructure the request body
    const {
      userId,
      employeeName,
      department,
      designation,
      date,
      completedTasks,
      ongoingTasks,
    } = req.body;

    // 1. Validate required fields
    if (
      !userId ||
      !employeeName ||
      !department ||
      !designation ||
      !date ||
      !completedTasks ||
      !ongoingTasks
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // 2. Find the employee by userId
    const employee = await Employee.findById(userId);

    // 3. Handle case when employee is not found
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // 4. Create a new WorkReport document
    const newWorkReport = new WorkReport({
      employeeName,
      department,
      designation,
      date,
      completedTasks,
      ongoingTasks,
      status: "Pending", // Default status
    });

    // 5. Save the WorkReport to the database
    await newWorkReport.save();

    // 6. Add the newly created work report's ObjectId to the employee's workReports array
    employee.workReports.push(newWorkReport._id as mongoose.Types.ObjectId);

    // 7. Save the employee document with the updated workReports array
    await employee.save();

    // 8. Send success response with the newly created work report
    res.status(201).json({
      message: "Work report submitted successfully",
      workReport: newWorkReport,
    });
  } catch (error) {
    // 9. Error handling with detailed logging and response
    console.error("❌ Error submitting work report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getWorkReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    const employee = await Employee.findById(employeeId).populate(
      "workReports"
    );

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    const workReports = employee.workReports;

    res.status(200).json(workReports);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getWorkReportsForManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      console.error("Error: Employee ID is missing in the request body");
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    // Find the manager's employee record
    const manager = await Employee.findById(employeeId);
    if (!manager) {
      console.error(`Error: Manager with ID ${employeeId} not found`);
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    // Get the manager's department
    const department = await Department.findById(manager.department);
    if (!department) {
      console.error(
        `Error: Department with ID ${manager.department} not found`
      );
      res.status(404).json({ message: "Department not found" });
      return;
    }

    // Find all employees in the same department
    const employees = await Employee.find({
      department: department._id,
    }).populate("workReports");

    if (employees.length === 0) {
      console.log(
        `No employees found in department: ${department.departmentName}`
      );
      res.status(200).json([]);
      return;
    }

    // Extract all work reports
    const workReports = employees.flatMap((emp) => emp.workReports);

    res.status(200).json(workReports);
  } catch (error) {
    console.error("Error fetching work reports for manager:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getWorkReportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reportId } = req.params; // Get report ID from URL

    if (!reportId) {
      console.error("Error: Work report ID is missing in the request params");
      res.status(400).json({ message: "Work report ID is required" });
      return;
    }

    // Find the work report directly by its ID
    const workReport = await WorkReport.findById(reportId);

    if (!workReport) {
      console.error(`Error: Work report with ID ${reportId} not found`);
      res.status(404).json({ message: "Work report not found" });
      return;
    }

    res.status(200).json(workReport); // Send the work report data
  } catch (error) {
    console.error("Error fetching work report details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
