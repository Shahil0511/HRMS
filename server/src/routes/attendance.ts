import express from "express";
import {
  checkIn,
  checkOut,
  getEmployeeAttendanceList,
  getTodayPresentEmployees,
  getEmployeeAttendanceThisMonth,
  getEmployeeAttendancebyID,
} from "../controllers/attendanceController";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/verifyAdmin";

const router = express.Router();

/**
 * Route for employee check-in.
 * Protected: Requires authentication.
 */
router.post("/check-in", verifyToken, checkIn);

/**
 * Route for employee check-out.
 * Protected: Requires authentication.
 */
router.post("/check-out", verifyToken, checkOut);

/**
 * Route to get the logged-in employee's attendance records.
 * Protected: Requires authentication.
 */
router.get("/employee", verifyToken, getEmployeeAttendanceList);

/**
 * Route to get today's present employees.
 * Protected: Requires authentication and admin privileges.
 */
router.get("/today", verifyToken, isAdmin, getTodayPresentEmployees);

router.get("/total-attendance", verifyToken, getEmployeeAttendanceThisMonth);

router.get("/employee/:id", verifyToken, getEmployeeAttendancebyID);

export default router;
