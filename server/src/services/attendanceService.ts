import mongoose from "mongoose";
import Attendance from "../models/AttendanceSchema";
import { IAttendance } from "../types/attendance";

/**
 * Get today's attendance for an employee
 */
export const getTodayAttendance = async (
  employeeId: string,
  date: string
): Promise<IAttendance | null> => {
  try {
    const objectId = new mongoose.Types.ObjectId(employeeId); // Convert employeeId to ObjectId
    const attendance = await Attendance.findOne({ employeeId: objectId, date });

    return attendance;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw new Error("Failed to fetch attendance");
  }
};

/**
 * Mark attendance for an employee
 */
export const markAttendance = async (
  employeeId: string,
  date: string,
  checkIn: string,
  checkOut?: string
): Promise<IAttendance> => {
  try {
    const parsedEmployeeId = new mongoose.Types.ObjectId(employeeId); // Convert to ObjectId

    if (!checkIn) {
      throw new Error("Check-in time is required");
    }

    let duration = 0;
    if (checkOut) {
      if (new Date(checkOut) <= new Date(checkIn)) {
        throw new Error("Check-out time must be after check-in time");
      }
      duration =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60); // Calculate duration in hours
    }

    const attendance = new Attendance({
      employeeId: parsedEmployeeId,
      date,
      checkIn,
      checkOut: checkOut || null,
      status: checkOut ? "Present" : "Absent",
      duration,
    });

    return (await attendance.save()).toObject() as IAttendance;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw new Error("Failed to mark attendance");
  }
};
