import { Router } from "express";
import {
  addDepartment,
  getDepartments,
} from "../controllers/departmentController";
import { isAdmin } from "../middlewares/verifyAdmin";

const router = Router();

// Admin only: Add a new department
router.post("/departments", isAdmin, addDepartment);

// Public: Get all departments with optional search query
router.get("/departments", getDepartments);

export default router;
