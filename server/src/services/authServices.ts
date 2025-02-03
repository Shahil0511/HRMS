import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/UserSchema";

export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  // Compare password with hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: 401, message: "Invalid credentials" };
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role }, // ✅ Ensure role is included in token
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return token;
};
