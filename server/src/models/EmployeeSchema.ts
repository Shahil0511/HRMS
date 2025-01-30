import mongoose, { Schema, Document } from "mongoose";
import { IDepartment } from "./DepartmentSchema"; // Import the Department model

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  gender: string;
  dob: Date;
  phoneNumber: string;
  email: string;
  address: string;
  department: mongoose.Schema.Types.ObjectId | IDepartment; // Reference to Department model
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      set: (v: string) => v.charAt(0).toUpperCase() + v.slice(1), // Capitalize first letter before saving
      required: true,
    },
    dob: { type: Date, required: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    address: { type: String, required: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department", // Reference to Department model
      required: true,
    },
    designation: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
