import express from "express";
import { checkIn, checkOut } from "../controllers/attendanceController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);
export default router;
