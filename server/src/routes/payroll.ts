import { Router } from "express";
import {
  getPayroll,
  getTotalSalary,
  getPayrollAdmin,
} from "../controllers/payrollController";

import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/verifyAdmin";
const router = Router();

router.post("/", getPayroll);
router.post("/totalsalary", verifyToken, isAdmin, getTotalSalary);

router.get("/admin/employees/:id", verifyToken, isAdmin, getPayrollAdmin);

export default router;
