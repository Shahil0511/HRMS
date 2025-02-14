import { Router } from "express";
import {
  addDepartment,
  getDepartments,
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
router.get("/totaldepartment", getTotalDepartment);

export default router;
