import { Router } from "express";
import {
  addEmployee,
  getEmployees,
  getUserEmployeeData,
} from "../controllers/employeeController";
import { isAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Admin only: Add a new employee
router.post("/employees", verifyToken, isAdmin, addEmployee); // First verify token, then check if admin

// Public: Get all employees
router.get("/employees", getEmployees);

// Get the current authenticated user's employee data
router.get("/employees/user", verifyToken, getUserEmployeeData); // Ensure token is verified first

export default router;
