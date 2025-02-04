import express from "express";
import { Request, Response } from "express";
import { checkIn, checkOut } from "../controllers/attendanceController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Check-in and Check-out routes
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);

// Fetch today's attendance for a specific employee (individual)

export default router;
