import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/UserSchema";
import { HttpStatus } from "../utils/httpStatus";

export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { status: HttpStatus.UNAUTHORIZED, message: "Invalid credentials" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: HttpStatus.UNAUTHORIZED, message: "Invalid credentials" };
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
  return token;
};
