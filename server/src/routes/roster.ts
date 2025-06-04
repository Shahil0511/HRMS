import express from "express";
import {
  createWeeklyRoster,
  getWeeklyRosters,
} from "../controllers/rosterController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Weekly roster routes
router.post("/weekly", verifyToken, createWeeklyRoster);
router.get("/weekly", verifyToken, getWeeklyRosters);

export default router;
