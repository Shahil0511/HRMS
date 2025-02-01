import { Request, Response } from "express";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import {
  getTodayAttendance,
  markAttendance,
} from "../services/attendanceService";

/**
 * Get today's attendance for an employee
 */
export const getAttendanceForToday = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;

    // Validate employeeId (ObjectId format check)
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({
        success: false,
        message: "Invalid Employee ID format",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const attendance = await getTodayAttendance(employeeId, today);

    if (!attendance) {
      res.status(404).json({
        success: false,
        message: "Attendance not marked for today",
      });
      return;
    }

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

/**
 * Mark attendance for an employee
 */
export const markEmployeeAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, checkIn, checkOut } = req.body;

    // Validate input parameters
    if (!employeeId || !checkIn) {
      res.status(400).json({
        success: false,
        message: "Employee ID and check-in time are required",
      });
      return;
    }

    // Validate employeeId format (ObjectId check)
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({
        success: false,
        message: "Invalid Employee ID format",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const existingAttendance = await getTodayAttendance(employeeId, today);

    if (existingAttendance) {
      res.status(400).json({
        success: false,
        message: "Attendance already marked for today",
      });
      return;
    }

    // Mark attendance
    const attendance = await markAttendance(
      employeeId,
      today,
      checkIn,
      checkOut
    );

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
};
