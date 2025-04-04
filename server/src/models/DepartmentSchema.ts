import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  departmentName: string;
  description: string;
  headOfDepartment: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DepartmentSchema - Defines the schema for Department records.
 */
const DepartmentSchema: Schema = new Schema(
  {
    departmentName: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      minlength: [3, "Department name must be at least 3 characters"],
      maxlength: [50, "Department name must be at most 50 characters"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [250, "Description must be at most 250 characters"],
    },
    headOfDepartment: {
      type: String,
      required: [true, "Head of department is required"],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Indexing for optimized searches
DepartmentSchema.index({ headOfDepartment: 1 });

/**
 * Custom JSON transformation to exclude _id.
 */
DepartmentSchema.methods.toJSON = function () {
  const department = this.toObject();
  department.id = department._id;
  delete department._id;
  return department;
};

export const Department = mongoose.model<IDepartment>(
  "Department",
  DepartmentSchema
);
