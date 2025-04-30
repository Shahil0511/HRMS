import mongoose, { Schema, Document } from "mongoose";

/**
 * Structure for leave applications
 */
export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  department: string;
  designation: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalLeaveDuration: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Leave application records.
 */
const LeaveSchema: Schema = new Schema<ILeave>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    leaveType: {
      type: String,
      required: true,
      trim: true,
      enum: ["sick", "casual", "earned", "maternity", "paternity", "other"], // adjust as needed
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: any, value: Date) {
          return value >= this.startDate;
        },
        message: "End date must be greater than or equal to start date",
      },
    },
    totalLeaveDuration: {
      type: Number,
      required: true,
      min: [0.5, "Total leave duration must be at least half a day"],
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for common queries
LeaveSchema.index({ employeeId: 1, status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });

LeaveSchema.methods.toJSON = function () {
  const leave = this.toObject();
  leave.id = leave._id;
  delete leave._id;
  return leave;
};

export const Leave = mongoose.model<ILeave>("Leave", LeaveSchema);
