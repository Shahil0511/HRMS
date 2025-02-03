import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  employeeId: mongoose.Schema.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: "Present" | "Absent";
  duration?: number; // Auto-calculated
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, // Optimized query performance
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      validate: {
        validator: function (this: IAttendance, value: Date) {
          return !this.checkIn || (value && value > this.checkIn);
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
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to object
  }
);

// ✅ Virtual field to calculate duration (in hours)
AttendanceSchema.virtual("duration").get(function (this: IAttendance) {
  if (this.checkIn && this.checkOut) {
    return (
      (this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60)
    ); // Convert ms to hours
  }
  return 0;
});

// ✅ Ensure `duration` is included in queries
AttendanceSchema.set("toJSON", { virtuals: true });
AttendanceSchema.set("toObject", { virtuals: true });

const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
