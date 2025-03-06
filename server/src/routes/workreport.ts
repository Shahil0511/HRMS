import express from "express";
import { getEmployeeDetails } from "../controllers/employeeController";
import { submitWorkReport } from "../controllers/workReportController";

const router = express.Router();

router.post("/employeedetails", getEmployeeDetails);
router.post("/submit", submitWorkReport);

export default router;
