import express from "express";
import { signup } from "../controllers/authController";
import { validateSignup } from "../middlewares/validateSignup";

const router = express.Router();

router.post("/signup", validateSignup, signup);
export default router;
