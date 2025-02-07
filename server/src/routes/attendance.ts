import express from "express";
import {
  checkIn,
  checkOut,
  getEmployeeAttendanceList,
} from "../controllers/attendanceController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);
router.get("/employee", verifyToken, getEmployeeAttendanceList);
export default router;
