import mongoose, { Schema, Document } from "mongoose";

/**
 * IEmployee Interface - Defines the structure for Employee documents in MongoDB.
 */
export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dob: Date;
  phoneNumber: string;
  email: string;
  address: string;
  department: mongoose.Types.ObjectId;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * EmployeeSchema - Defines the schema for Employee records.
 */
const EmployeeSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
      set: (v: string) => v.charAt(0).toUpperCase() + v.slice(1), // Capitalize first letter
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
      ref: "Department",
      required: true,
    },
    designation: { type: String, required: true },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
