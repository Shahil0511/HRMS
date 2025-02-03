import { Router } from "express";
import {
  addEmployee,
  getEmployees,
  getUser,
} from "../controllers/employeeController";
import { isAdmin } from "../middlewares/verifyAdmin";

const router = Router();

router.post("/employees", isAdmin, addEmployee);

router.get("/employees", getEmployees);
router.get("/employees/user", getUser);

export default router;
