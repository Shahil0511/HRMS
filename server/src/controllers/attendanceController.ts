import { Request, Response } from "express";
import {
  getTodayAttendance,
  markAttendance,
} from "../services/attendanceService";
import moment from "moment";
import mongoose from "mongoose";
import Attendance from "../models/AttendanceSchema";

// ✅ 1. Employee Check-in
export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    const newCheckIn = await markAttendance(
      employeeId,
      moment().format("YYYY-MM-DD"),
      moment().toString()
    );

    res.status(201).json({ message: "Check-in recorded", data: newCheckIn });
  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({
      message: "Error checking in",
      error: (error as Error).message,
    });
  }
};

// ✅ 2. Employee Check-out
export const checkOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    const lastAttendance = await getTodayAttendance(
      employeeId,
      moment().format("YYYY-MM-DD")
    );

    if (!lastAttendance || lastAttendance.checkOut) {
      res.status(400).json({ message: "No active check-in found" });
      return;
    }

    lastAttendance.checkOut = new Date();
    lastAttendance.status = "Present";
    lastAttendance.duration =
      (new Date(lastAttendance.checkOut).getTime() -
        new Date(lastAttendance.checkIn).getTime()) /
      (1000 * 60 * 60); // Duration in hours
    await lastAttendance.save();

    res
      .status(200)
      .json({ message: "Check-out recorded", data: lastAttendance });
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({
      message: "Error checking out",
      error: (error as Error).message,
    });
  }
};

// ✅ 3. Fetch Today's Attendance for a specific employee
export const getAttendanceForToday = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const today = moment().startOf("day").toDate();

    const attendance = await getTodayAttendance(
      employeeId,
      moment().format("YYYY-MM-DD")
    );

    if (!attendance) {
      res.status(404).json({ message: "Attendance not found for today" });
      return;
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({
      message: "Error fetching today's attendance",
      error: (error as Error).message,
    });
  }
};

// ✅ 4. Fetch Attendance History
export const getAttendanceHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { startDate, endDate } = req.query;

    if (Array.isArray(startDate)) startDate = startDate[0];
    if (Array.isArray(endDate)) endDate = endDate[0];

    if (!startDate || !endDate) {
      res
        .status(400)
        .json({ message: "Both startDate and endDate are required." });
      return;
    }

    const start = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");

    if (!start.isValid() || !end.isValid()) {
      res.status(400).json({ message: "Invalid startDate or endDate format" });
      return;
    }

    const history = await Attendance.find({
      date: { $gte: start.toDate(), $lte: end.toDate() },
    }).populate("employeeId");

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({
      message: "Error fetching attendance history",
      error: (error as Error).message,
    });
  }
};
