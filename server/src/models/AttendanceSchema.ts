import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  employeeId: mongoose.Schema.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: "Present" | "Absent";
  duration?: number; // Will be auto-calculated
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, // Speeds up queries
    },
    date: {
      type: Date,
      required: true,
      index: true, // Faster retrieval by date
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      validate: {
        validator: function (this: IAttendance, value: Date) {
          return !this.checkIn || value > this.checkIn;
        },
        message: "Check-out time must be after check-in time.",
      },
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Virtual field to calculate duration in hours
AttendanceSchema.virtual("duration").get(function (this: IAttendance) {
  if (this.checkIn && this.checkOut) {
    return (
      (this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60)
    ); // Convert ms to hours
  }
  return 0;
});

const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
