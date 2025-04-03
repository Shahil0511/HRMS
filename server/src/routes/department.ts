import { Router } from "express";
import {
  addDepartment,
  getDepartmentDetails,
  getDepartments,
  getTodayTotalDepartmentPresent,
  getTotalDepartment,
} from "../controllers/departmentController";
import { isAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

/**
 * Route to add a new department.
 * Protected: Requires authentication and admin privileges.
 */
router.post("/departments", verifyToken, isAdmin, addDepartment);

/**
 * Route to get all departments.
 * Public: Can be accessed without authentication.
 * Supports optional search queries.
 */
router.get("/departments", getDepartments);
router.get("/departments/totaldepartment", getTotalDepartment);
router.post("/department/todayPresent", getTodayTotalDepartmentPresent);
router.get("/departments/:id", getDepartmentDetails);

export default router;
