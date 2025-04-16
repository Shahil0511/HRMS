import express from "express";
import { getEmployeeDetails } from "../controllers/employeeController";
import {
  approveWorkReport,
  getAllWorkReportsForAdmin,
  getWorkReportById,
  getWorkReports,
  getWorkReportsForManager,
  rejectWorkReport,
  submitWorkReport,
  updateWorkReport,
} from "../controllers/workReportController";
import { isAdmin } from "../middlewares/verifyAdmin";
import { verifyToken } from "../middlewares/verifyToken";
import { isManager } from "../middlewares/isManager";

const router = express.Router();

router.post("/employeedetails", getEmployeeDetails);
router.post("/submit", submitWorkReport);
router.post("/history", getWorkReports);
router.post(
  "/manager/history",
  verifyToken,
  isManager,
  getWorkReportsForManager
);
router.post("/admin/history", verifyToken, isAdmin, getAllWorkReportsForAdmin);
router.get("/manager/workreport/:reportId", getWorkReportById);
router.put("/:id/approve", verifyToken, approveWorkReport);
router.put("/:id/reject", verifyToken, rejectWorkReport);
router.put("/edit/:reportId", updateWorkReport);

export default router;
