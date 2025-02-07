import { Request, Response } from "express";
import Attendance from "../models/AttendanceSchema";
import { RequestWithUser } from "../middlewares/verifyToken";

export const checkIn = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const date = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Create a new attendance record for the check-in
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

export const checkOut = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { id: employeeId } = req.user!;
    const date = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

    // Find the last check-in for the employee on the given date that has not been checked out yet
    const attendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
      checkOut: null, // Only get the session that hasn't been checked out
    });

    if (!attendance) {
      res.status(400).json({ message: "No active check-in found for today." });
      return;
    }

    // Update the check-out time for the session
    attendance.checkOut = new Date();

    await attendance.save();

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
