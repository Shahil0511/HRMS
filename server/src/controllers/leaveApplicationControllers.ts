import { Request, Response } from "express";
import mongoose from "mongoose";
import { Leave } from "../models/LeavesApplicationSchema";
import { ILeave } from "../models/LeavesApplicationSchema";
import { User } from "../models/UserSchema";

// Create a new Leave
export const newLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate and parse dates
    const startDateInput = req.body.startDate;
    const parsedStartDate = new Date(startDateInput);
    const endDateInput = req.body.endDate;
    const parsedEndDate = new Date(endDateInput);

    if (isNaN(parsedStartDate.getTime())) {
      res.status(400).json({ error: "Invalid start date format" });
      return;
    }

    if (isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ error: "Invalid end date format" });
      return;
    }

    if (parsedEndDate < parsedStartDate) {
      res.status(400).json({ error: "End date cannot be before start date" });
      return;
    }

    const newLeaveData: ILeave = new Leave({
      _id: new mongoose.Types.ObjectId(),
      employeeId: req.body.employeeId,
      employeeName: req.body.employeeName,
      department: req.body.department,
      designation: req.body.designation,
      leaveType: req.body.leaveType,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      totalLeaveDuration: req.body.totalLeaveDuration,
      reason: req.body.reason,
      status: req.body.status || "Pending",
    });

    const savedLeave = await newLeaveData.save();
    res.status(201).json({
      message: "Leave created successfully",
      leave: savedLeave,
    });
  } catch (error: any) {
    console.error("Error creating leave:", error.message);
    res.status(500).json({
      message: "Error creating leave",
      error: error.message,
    });
  }
};

// Get all leaves
export const getAllLeaves = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const leaves = await Leave.find().populate("employeeId");
    res.status(200).json(leaves);
  } catch (error: any) {
    console.error("Error fetching leaves:", error.message);
    res.status(500).json({
      message: "Error fetching leaves",
      error: error.message,
    });
  }
};

// Get all leaves by employee ID
export const getLeavesByEmployeeId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employeeId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({ message: "Invalid employee ID" });
      return;
    }

    // Check if the user exists
    const user = await User.findById(employeeId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Fetch leaves using employeeId (user._id)
    const leaves = await Leave.find({ employeeId: user.employeeId });

    if (!leaves || leaves.length === 0) {
      res.status(404).json({ message: "No leaves found for this employee" });
      return;
    }

    res.status(200).json(leaves);
  } catch (error: any) {
    console.error("🔥 Error fetching leaves:", error.message);
    res.status(500).json({
      message: "Error fetching leaves",
      error: error.message,
    });
  }
};

// Get leave by ID
export const getLeaveById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const leaveId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      res.status(400).json({ message: "Invalid leave ID" });
      return;
    }

    const leave = await Leave.findById(leaveId).populate("employeeId");

    if (!leave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    res.status(200).json(leave);
  } catch (error: any) {
    console.error("Error fetching leave:", error.message);
    res.status(500).json({
      message: "Error fetching leave",
      error: error.message,
    });
  }
};

// Update leave status
export const updateLeaveStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const leaveId = req.params.id;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      res.status(400).json({ message: "Invalid leave ID" });
      return;
    }

    const validStatuses = ["Pending", "Approved", "Rejected", "Cancelled"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    ).populate("employeeId");

    if (!updatedLeave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    res.status(200).json({
      message: "Leave status updated successfully",
      leave: updatedLeave,
    });
  } catch (error: any) {
    console.error("Error updating leave status:", error.message);
    res.status(500).json({
      message: "Error updating leave status",
      error: error.message,
    });
  }
};

export const submitLeave = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      employeeId,
      employeeName,
      department,
      designation,
      leaveType,
      reason,
      startDate,
      endDate,
      totalLeaveDuration,
    } = req.body;

    // Validate required fields
    if (
      !employeeId ||
      !startDate ||
      !endDate ||
      !totalLeaveDuration ||
      !leaveType
    ) {
      res.status(400).json({ error: "Missing required fields" });
    }

    // Validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime())) {
      res.status(400).json({ error: "Invalid start date format" });
    }

    if (isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ error: "Invalid end date format" });
    }

    if (parsedEndDate < parsedStartDate) {
      res.status(400).json({ error: "End date cannot be before start date" });
    }

    // Convert totalLeaveDuration to number (in case it comes as string "8")
    const duration = Number(totalLeaveDuration);
    if (isNaN(duration) || duration <= 0) {
      res.status(400).json({ error: "Invalid leave duration" });
    }

    const newLeave = await Leave.create({
      employeeId,
      employeeName,
      department,
      designation,
      leaveType,
      reason,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      totalLeaveDuration: duration,
      status: "Pending", // Default status
    });

    res.status(201).json({
      message: "Leave request submitted successfully",
      data: newLeave,
    });
  } catch (error) {
    console.error("Error submitting leave:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateLeave = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the leave by ID and update it
    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedLeave) {
      res.status(404).json({ message: "Leave not found" });
      return;
    }

    res.status(200).json({
      message: "Leave updated successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ message: "Error updating leave" });
  }
};
