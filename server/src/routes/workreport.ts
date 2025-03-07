import express from "express";
import { getEmployeeDetails } from "../controllers/employeeController";
import {
  getWorkReportById,
  getWorkReports,
  getWorkReportsForManager,
  submitWorkReport,
} from "../controllers/workReportController";

const router = express.Router();

router.post("/employeedetails", getEmployeeDetails);
router.post("/submit", submitWorkReport);
router.post("/history", getWorkReports);
router.post("/manager/history", getWorkReportsForManager);
router.get("/manager/workreport/:reportId", getWorkReportById);

export default router;
