import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "employee" | "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.isAdmin = function (): boolean {
  return this.role === "admin";
};

export const User = mongoose.model<IUser>("User", UserSchema);
