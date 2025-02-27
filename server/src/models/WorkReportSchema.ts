import mongoose, { Schema, Document } from "mongoose";

/**
 * Work Report Interface - Defines the structure for Work Reports.
 */
export interface IWorkReport extends Document {
  _id: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId; // Admin or Manager who assigns the task
  assignedTo: mongoose.Types.ObjectId; // Employee or Manager receiving the task
  title: string;
  description: string;
  deadline: Date;
  priority: "Low" | "Medium" | "High" | "Critical"; // Enterprise-level task prioritization
  status: "Pending" | "In Progress" | "Completed" | "Not Done" | "Overdue"; // More detailed tracking
  submittedBy?: mongoose.Types.ObjectId; // Employee or Manager submitting the report
  submissionText?: string; // Work report in text format
  submissionFile?: string; // Path to uploaded file (PDF, DOCX)
  feedback?: string; // Admin or Manager's feedback on submission
  reviewedBy?: mongoose.Types.ObjectId; // Who reviewed the work report
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Work Report Schema - Defines the schema for work reports.
 */
const WorkReportSchema: Schema = new Schema(
  {
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The Admin or Manager assigning the work
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // The Employee or Manager receiving the work
      required: true,
      index: true, // Optimized for queries
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Not Done", "Overdue"],
      default: "Pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    submissionText: { type: String, trim: true }, // Optional text-based report
    submissionFile: { type: String }, // Optional file path for PDF/DOCX submission
    feedback: { type: String, trim: true }, // Feedback from Admin/Manager
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/**
 * Indexes for Enterprise-Level Performance Optimization
 */
WorkReportSchema.index({ assignedTo: 1, status: 1 });
WorkReportSchema.index({ deadline: 1 });
WorkReportSchema.index({ createdAt: -1 });

export const WorkReport = mongoose.model<IWorkReport>(
  "WorkReport",
  WorkReportSchema
);
