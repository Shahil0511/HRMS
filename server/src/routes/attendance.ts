import { Router } from "express";
import {
  getAttendanceForToday,
  markEmployeeAttendance,
} from "../controllers/attendanceController";

const router = Router();

// Get today's attendance for an employee
router.get("/:employeeId/today", getAttendanceForToday);

// Mark attendance for an employee
router.post("/", markEmployeeAttendance);

export default router;
