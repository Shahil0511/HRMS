import mongoose from "mongoose";

export interface IAttendance extends mongoose.Document {
  employeeId: mongoose.Schema.Types.ObjectId;
  date: Date; // Change from string to Date
  checkIn: Date; // Also ensure checkIn is stored as a Date
  checkOut?: Date;
  status: "Present" | "Absent";
  duration?: number;
}
