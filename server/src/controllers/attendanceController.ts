import { Request, Response } from "express";
import moment from "moment";
import {
  markAttendance,
  getTodayAttendance,
} from "../services/attendanceService";
import { Employee } from "../models/EmployeeSchema";
import Attendance from "../models/AttendanceSchema";

export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
  
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

    // ✅ Allow multiple check-ins per day
    const today = moment().startOf("day").toDate();
    const lastAttendance = await getTodayAttendance(employeeId, today);

    // If last check-in exists but no check-out, prevent another check-in
    if (lastAttendance && !lastAttendance.checkOut) {
      res
        .status(400)
        .json({ message: "Please check out before checking in again" });
      return;
    }

    // ✅ Allow new check-in since either no check-in exists or the last check-in was completed
    const newCheckIn = await markAttendance(employeeId, today, new Date());

    
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

    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    // ✅ Fetch the most recent check-in (instead of first check-in of the day)
    const lastAttendance = await Attendance.findOne({
      employeeId,
      checkOut: null, // ✅ Only fetch records where checkOut is missing
    }).sort({ checkIn: -1 }); // ✅ Get the latest check-in

    if (!lastAttendance) {
      res.status(400).json({ message: "No active check-in found" });
      return;
    }

    // ✅ Update check-out time and calculate duration
    lastAttendance.checkOut = new Date();
    lastAttendance.status = "Present";
    lastAttendance.duration = parseFloat(
      (
        (lastAttendance.checkOut.getTime() - lastAttendance.checkIn.getTime()) /
        (1000 * 60 * 60)
      ).toFixed(2)
    );

    await lastAttendance.save();

   
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
