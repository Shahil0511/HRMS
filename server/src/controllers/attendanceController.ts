import { Request, Response } from "express";
import Attendance from "../models/AttendanceSchema";
import { RequestWithUser } from "../middlewares/verifyToken";

/**
 * Check-in for an employee.
 */
export const checkIn = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const date = new Date().toISOString().split("T")[0];

    // Create a new attendance record for check-in
    const attendance = new Attendance({
      employeeId,
      date: new Date(),
      checkIn: new Date(),
      status: "Present",
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Check-out for an employee.
 */
export const checkOut = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const date = new Date().toISOString().split("T")[0];

    // Find the last check-in for the employee that hasn't been checked out
    const attendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
      checkOut: null,
    });

    if (!attendance) {
      res.status(400).json({ message: "No active check-in found for today." });
      return;
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Get attendance records for an individual employee.
 */
export const getEmployeeAttendanceList = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const attendanceRecords = await Attendance.find({ employeeId }).sort({
      date: -1,
    });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Admin: Get all attendance records (with pagination and filtering).
 */
export const getAllAttendanceRecords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, employeeId, date } = req.query;

    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;
    if (date) filter.date = new Date(date as string);

    const totalRecords = await Attendance.countDocuments(filter);
    const attendanceRecords = await Attendance.find(filter)
      .populate("employeeId", "firstName lastName department designation") // Fetch employee details
      .sort({ date: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / +limit),
      currentPage: +page,
      attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching all attendance records:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
