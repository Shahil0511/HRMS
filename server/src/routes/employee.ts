import { Router } from "express";
import { addEmployee, getEmployees } from "../controllers/employeeController";
import { isAdmin } from "../middlewares/verifyAdmin";

const router = Router();

router.post("/employees", isAdmin, addEmployee);

router.get("/employees", getEmployees);

export default router;
