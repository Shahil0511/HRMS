import express from "express";
import {
  checkIn,
  checkOut,
  getAttendanceForToday,
  getAttendanceHistory,
} from "../controllers/attendanceController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Check-in and Check-out routes
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);

// Fetch today's attendance for a specific employee (individual)
router.get("/:employeeId/today", verifyToken, getAttendanceForToday);

// Fetch attendance history for employees
router.get("/history", verifyToken, getAttendanceHistory);

export default router;
