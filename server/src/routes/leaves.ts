// File: server/src/routes/leaves.ts

import { Router } from "express";
import { getEmployeeDetails } from "../controllers/employeeController";
import {
  getAllLeaves,
  getLeaveById,
  getLeavesByEmployeeId,
  newLeave,
  submitLeave,
  updateLeave,
  getAllLeavesForAdmin,
} from "../controllers/leaveApplicationControllers";

// import { isEmployee } from "../middlewares/isEmployee";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/verifyAdmin";

const router = Router();

router.post("/newLeave", verifyToken, newLeave); // /api/leave/apply
router.get("/allLeaves", getAllLeaves); // /api/leave/allLeaves
router.get("/getLeavesByEmpID/:id", getLeavesByEmployeeId); // /api/leave/getLeavesByEmpID/:id
router.get("/getLeaveById/:id", getLeaveById);
router.post("/submit", verifyToken, submitLeave);
router.put("/edit/:id", verifyToken, updateLeave);
router.post("/employeedetails", getEmployeeDetails);
router.post("/admin/history", getAllLeavesForAdmin);

export default router;
