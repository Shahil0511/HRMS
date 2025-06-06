// Add these routes to your existing roster routes file

import express from "express";
import {
  createWeeklyRoster,
  getWeeklyRosters,
  updateWeeklyRoster,
  deleteWeeklyRoster,
  updateTimeSlotAssignments,
  // Add these new imports
  getEmployeeWeeklyRosters,
} from "../controllers/rosterController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Weekly roster routes (Admin only)
router.post("/weekly", verifyToken, createWeeklyRoster);
router.get("/weekly", verifyToken, getWeeklyRosters);
router.put("/weekly/:rosterId", verifyToken, updateWeeklyRoster);
router.patch(
  "/weekly/:rosterId/timeslot",
  verifyToken,
  updateTimeSlotAssignments
);
router.delete("/weekly/:rosterId", verifyToken, deleteWeeklyRoster);

// Employee routes (for viewing their own roster)
// Employee roster routes
router.get("/employee/weekly", verifyToken, getEmployeeWeeklyRosters);
export default router;
