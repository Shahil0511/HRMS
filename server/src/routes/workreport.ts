import express from "express";
import { getEmployeeDetails } from "../controllers/employeeController";

const router = express.Router();

router.post("/employeedetails", getEmployeeDetails);

export default router;
