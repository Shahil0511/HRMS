import { Router } from "express";
import { getPayroll } from "../controllers/payrollController";
const router = Router();

router.post("/", getPayroll);
export default router;
