import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

/**
 * IUser Interface - Defines the structure for User documents in MongoDB.
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "employee" | "manager" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isAdmin(): boolean;
  isManager(): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * UserSchema - Mongoose schema for user authentication and roles.
 */
const UserSchema: Schema<IUser> = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, // Optimized indexing
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, // Optimized for fast lookups
    },
    password: { type: String, required: true, select: false }, // Exclude from queries by default
    role: {
      type: String,
      enum: ["employee", "admin", "manager"],
      default: "employee",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Middleware: Hash password before saving.
 */
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance Methods for Role-based Access Control.
 */
UserSchema.methods.isAdmin = function (): boolean {
  return this.role === "admin";
};

UserSchema.methods.isManager = function (): boolean {
  return this.role === "manager";
};

/**
 * Compare hashed password.
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * User Model.
 */
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
