import express from "express";
import { getEmployeeDetails } from "../controllers/employeeController";
import {
  getWorkReports,
  submitWorkReport,
} from "../controllers/workReportController";

const router = express.Router();

router.post("/employeedetails", getEmployeeDetails);
router.post("/submit", submitWorkReport);
router.post("/history", getWorkReports);

export default router;
