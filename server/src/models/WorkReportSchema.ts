import mongoose, { Schema, Document } from "mongoose";

/**
 * Work Report Interface - Defines the structure for Work Reports.
 */
export interface IWorkReport extends Document {
  employeeName: string;
  department: string;
  designation: string;
  date: string; // You can use Date type if you want proper date handling
  completedTasks: string;
  ongoingTasks: string;
  status: "Pending" | "Approved" | "Rejected"; // Status of the report
  createdAt: Date; // Automatically set by mongoose
  updatedAt: Date; // Automatically set by mongoose
}

// Work Report Schema
const WorkReportSchema: Schema = new Schema(
  {
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    date: { type: String, required: true }, // You can change to Date type if necessary
    completedTasks: { type: String, required: true },
    ongoingTasks: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the model
export const WorkReport = mongoose.model<IWorkReport>(
  "WorkReport",
  WorkReportSchema
);
