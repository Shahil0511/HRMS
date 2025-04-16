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
export const getAllWorkReportsForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch all work reports directly

    const workReports = await WorkReport.find().sort({ createdAt: -1 });

    if (!workReports.length) {
      console.log("No work reports found.");
      res.status(200).json({ message: "No work reports available" });
      return;
    }

    res.status(200).json(workReports);
  } catch (error) {
    console.error("Error fetching all work reports for admin:", error);
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

export const approveWorkReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const workReport = await WorkReport.findById(id);
    if (!workReport) {
      res
        .status(404)
        .json({ success: false, message: "Work report not found" });
      return;
    }

    workReport.status = "Approved";
    await workReport.save();

    res.status(200).json({
      success: true,
      message: "Work report approved successfully",
      data: workReport,
    });
  } catch (error) {
    console.error("Error approving work report:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reject Work Report
export const rejectWorkReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const workReport = await WorkReport.findById(id);
    if (!workReport) {
      res
        .status(404)
        .json({ success: false, message: "Work report not found" });
      return;
    }

    workReport.status = "Rejected";
    await workReport.save();

    res.status(200).json({
      success: true,
      message: "Work report rejected successfully",
      data: workReport,
    });
  } catch (error) {
    console.error("Error rejecting work report:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Get Single Work Report (to match frontend service)
export const getSingleWorkReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reportId } = req.params; // Get report ID from URL

    if (!reportId) {
      res.status(400).json({ message: "Work report ID is required" });
      return;
    }

    const workReport = await WorkReport.findById(reportId);

    if (!workReport) {
      res.status(404).json({ message: "Work report not found" });
      return;
    }

    res.status(200).json(workReport);
  } catch (error) {
    console.error(`Error fetching work report:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Work Report
export const updateWorkReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reportId } = req.params;
    const {
      employeeName,
      department,
      designation,
      date,
      completedTasks,
      ongoingTasks,
    } = req.body;

    // Validate required fields
    if (
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

    const workReport = await WorkReport.findById(reportId);

    if (!workReport) {
      res.status(404).json({ message: "Work report not found" });
      return;
    }

    // Update the work report
    workReport.employeeName = employeeName;
    workReport.department = department;
    workReport.designation = designation;
    workReport.date = date;
    workReport.completedTasks = completedTasks;
    workReport.ongoingTasks = ongoingTasks;

    await workReport.save();

    res.status(200).json({
      message: "Work report updated successfully",
      workReport,
    });
  } catch (error) {
    console.error("Error updating work report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
