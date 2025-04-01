import { Router } from "express";
import { getPayroll, getTotalSalary } from "../controllers/payrollController";

import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/verifyAdmin";
const router = Router();

router.post("/", getPayroll);
router.post("/totalsalary", verifyToken, isAdmin, getTotalSalary);

export default router;
