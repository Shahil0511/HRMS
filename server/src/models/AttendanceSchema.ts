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
          if (!value) return true; // ✅ Allow null check-out on check-in
          return value > this.checkIn;
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

// ✅ Convert and store IST (Indian Standard Time) before saving
AttendanceSchema.pre("save", function (next) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

  // Convert 'date' to midnight IST before storing
  this.date = new Date(this.date.setHours(0, 0, 0, 0) + IST_OFFSET);

  // Convert check-in and check-out times to IST before storing
  if (this.checkIn) this.checkIn = new Date(this.checkIn.getTime() + IST_OFFSET);
  if (this.checkOut) this.checkOut = new Date(this.checkOut.getTime() + IST_OFFSET);

  next();
});

// ✅ Virtual field for auto-calculating duration (in hours)
AttendanceSchema.virtual("duration").get(function (this: IAttendance) {
  if (this.checkIn && this.checkOut) {
    return (this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60); // Convert ms to hours
  }
  return 0;
});

const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
