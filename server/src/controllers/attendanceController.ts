import { Request, Response } from "express";
import moment from "moment";
import {
  markAttendance,
  getTodayAttendance,
} from "../services/attendanceService";
import { Employee } from "../models/EmployeeSchema";

export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("✅ Check-In Request Received:", req.body);
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    // Verify Employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: "Invalid Employee ID" });
      return;
    }

    // Check if already checked in today
    const today = moment().startOf("day").toDate();
    const existingAttendance = await getTodayAttendance(employeeId, today);

    if (existingAttendance) {
      res.status(400).json({ message: "You have already checked in today" });
      return;
    }

    // Mark attendance
    const newCheckIn = await markAttendance(employeeId, today, new Date());

    console.log("✅ Check-In Successful:", newCheckIn);
    res.status(201).json({ message: "Check-in recorded", data: newCheckIn });
  } catch (error: unknown) {
    console.error("❌ Error during check-in:", error);
    res.status(500).json({
      message: "Error checking in",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const checkOut = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("✅ Check-Out Request Received:", req.body);
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    // Fetch today's attendance
    const today = moment().startOf("day").toDate();
    const lastAttendance = await getTodayAttendance(employeeId, today);

    if (!lastAttendance || lastAttendance.checkOut) {
      res.status(400).json({ message: "No active check-in found" });
      return;
    }

    // Update check-out time
    lastAttendance.checkOut = new Date();
    lastAttendance.status = "Present";
    lastAttendance.duration = parseFloat(
      (
        (lastAttendance.checkOut.getTime() - lastAttendance.checkIn.getTime()) /
        (1000 * 60 * 60)
      ).toFixed(2)
    );

    await lastAttendance.save();

    console.log("✅ Check-Out Successful:", lastAttendance);
    res
      .status(200)
      .json({ message: "Check-out recorded", data: lastAttendance });
  } catch (error: unknown) {
    console.error("❌ Error during check-out:", error);
    res.status(500).json({
      message: "Error checking out",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
