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
import { getTotalDepartmentEmployees } from "../controllers/departmentController";
import { isManager } from "../middlewares/isManager";

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
router.get("/employees", verifyToken, isAdmin, getEmployees);

/**
 * Route to get the currently authenticated user's employee data.
 * Protected: Requires authentication.
 */
router.get("/employees/user", verifyToken, getUserEmployeeData);

router.get(
  "/employees/totalemployees",
  verifyToken,
  isAdmin,
  getTotalEmployees
);

router.get(
  "/employees/todaypresent",
  verifyToken,
  isAdmin,
  getTodayPresentTotal
);

router.get("/employees/:id", verifyToken, getEmployeeById);

router.get("/employees/profile/myprofile", verifyToken, getEmployeeProfile);

router.get(
  "/department/totalEmployees",
  verifyToken,
  isManager,
  getTotalDepartmentEmployees
);

router.post(
  "/employees/department_employee",
  verifyToken,
  getEmployeesByDepartment
);

export default router;
