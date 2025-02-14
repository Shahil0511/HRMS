import { Router } from "express";
import {
  addEmployee,
  getEmployees,
  getUserEmployeeData,
  getTotalEmployees,
} from "../controllers/employeeController";
import { isAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";
import { getTodayPresentTotal } from "../controllers/attendanceController";

const router = Router();

/**
 * Route to add a new employee.
 * Protected: Requires authentication and admin privileges.
 */
router.post("/employees", verifyToken, isAdmin, addEmployee);

/**
 * Route to get all employees.
 * Public: Can be accessed without authentication.
 */
router.get("/employees", getEmployees);

/**
 * Route to get the currently authenticated user's employee data.
 * Protected: Requires authentication.
 */
router.get("/employees/user", verifyToken, getUserEmployeeData);

router.get("/employees/totalemployees", getTotalEmployees);

router.get("/employees/todaypresent", getTodayPresentTotal);
export default router;
