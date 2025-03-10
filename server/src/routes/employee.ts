import { Router } from "express";
import {
  addEmployee,
  getEmployees,
  getUserEmployeeData,
  getTotalEmployees,
  getEmployeeById,
  getEmployeeProfile,
  getEmployeesByDepartment,
} from "../controllers/employeeController";
import { isAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";
import { getTodayPresentTotal } from "../controllers/attendanceController";
import {
  // getTodayTotalDepartmentPresent,
  getTotalDepartmentEmployees,
} from "../controllers/departmentController";

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

router.get(
  "/employees/totalemployees",

  getTotalEmployees
);

router.get(
  "/employees/todaypresent",

  getTodayPresentTotal
);

router.get("/employees/:id", getEmployeeById);
router.get(
  "/employees/profile/myprofile",

  getEmployeeProfile
);

router.get("/department/totalEmployees", getTotalDepartmentEmployees);

router.post("/employees/department_employee", getEmployeesByDepartment);

export default router;
