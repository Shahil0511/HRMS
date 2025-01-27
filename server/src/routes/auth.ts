import express from "express";
import { signup, login } from "../controllers/authController";
import { validateSignup } from "../middlewares/validateSignup";
import { loginValidator } from "../validators/authValidator";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";

const router = express.Router();

// User signup
router.post("/signup", validateSignup, signup);

// User login
router.post("/login", loginValidator, handleValidationErrors, login);

export default router;
