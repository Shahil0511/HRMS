import Attendance from "../models/AttendanceSchema";
import mongoose from "mongoose";
import moment from "moment";

export const markAttendance = async (
  employeeId: string,
  date: Date,
  checkIn: Date
) => {
  try {
    const parsedEmployeeId = new mongoose.Types.ObjectId(employeeId);

    const attendance = new Attendance({
      employeeId: parsedEmployeeId,
      date,
      checkIn,
      checkOut: null,
      status: "Present",
      duration: 0,
    });

    return (await attendance.save()).toObject();
  } catch (error) {
    console.error("❌ Error marking attendance:", error);
    throw new Error("Failed to mark attendance");
  }
};

export const getTodayAttendance = async (employeeId: string, date: Date) => {
  try {
    const parsedEmployeeId = new mongoose.Types.ObjectId(employeeId); // Ensure ObjectId

    const startOfDay = moment(date).startOf("day").toDate();
    const endOfDay = moment(date).endOf("day").toDate();

    // Fetch today's attendance record
    const attendance = await Attendance.findOne({
      employeeId: parsedEmployeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    return attendance;
  } catch (error) {
    console.error("❌ Error fetching today's attendance:", error);
    throw new Error("Failed to fetch today's attendance");
  }
};
