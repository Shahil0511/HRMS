import { Request, Response } from "express";

import { Employee } from "../models/EmployeeSchema";
import { WorkReport } from "../models/WorkReportSchema";
import mongoose from "mongoose";

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
