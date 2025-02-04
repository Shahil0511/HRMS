import express from "express";
import { Request, Response } from "express";
import { checkIn, checkOut } from "../controllers/attendanceController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();
router.post("/test", (req: Request, res: Response) => {
  console.log("Test Route hit," + req.body); // Fix by concatenating the string
  res.json({ success: true, body: req.body });
});

// Check-in and Check-out routes
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);

// Fetch today's attendance for a specific employee (individual)

export default router;
