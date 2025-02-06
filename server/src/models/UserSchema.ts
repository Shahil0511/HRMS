import mongoose, { Schema, Document } from "mongoose";

/**
 * IUser Interface - Defines the structure for User documents in MongoDB.
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId; // Use ObjectId type for references
  name: string;
  email: string;
  password: string;
  role: "employee" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserSchema - Mongoose schema for user authentication and roles.
 */
const UserSchema: Schema = new Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Linking to the Employee collection
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Checks if the user has admin privileges.
 * @returns {boolean} True if admin, otherwise false.
 */
UserSchema.methods.isAdmin = function (): boolean {
  return this.role === "admin";
};

export const User = mongoose.model<IUser>("User", UserSchema);
