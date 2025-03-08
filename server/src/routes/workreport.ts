import express from "express";
import { getEmployeeDetails } from "../controllers/employeeController";
import {
  approveWorkReport,
  getWorkReportById,
  getWorkReports,
  getWorkReportsForManager,
  rejectWorkReport,
  submitWorkReport,
} from "../controllers/workReportController";

const router = express.Router();

router.post("/employeedetails", getEmployeeDetails);
router.post("/submit", submitWorkReport);
router.post("/history", getWorkReports);
router.post("/manager/history", getWorkReportsForManager);
router.get("/manager/workreport/:reportId", getWorkReportById);
router.put("/:id/approve", approveWorkReport);
router.put("/:id/reject", rejectWorkReport);

export default router;
