import { Request, Response } from "express";
import { loginUser } from "../services/authServices";
import { authErrorHandler } from "../services/authServices";
import { Employee } from "../models/EmployeeSchema";
import { User } from "../models/UserSchema";

/**
 * User login controller.
 * Authenticates a user and returns a JWT token along with user details.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Validate input fields early
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Authenticate user and generate JWT token
    const token = await loginUser(email, password);

    // Fetch user details and return response
    const user = await User.findOne({ email })
      .select("name email role isActive employeeId")
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Fetch associated employee details if necessary
    const employee = user.employeeId
      ? await Employee.findById(user.employeeId)
          .select("firstName lastName")
          .lean()
      : null;

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "unknown",
        isActive: user.isActive,
        employeeId: employee ? employee._id : null,
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : null,
      },
    });
  } catch (error: any) {
    authErrorHandler(error, req, res); // Use the centralized error handler
  }
};
