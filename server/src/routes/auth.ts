import express from "express";
import { signup, login } from "../controllers/userController"; // Adjust based on your file structure
import { validateSignup } from "../middlewares/validateSignup";
import { loginValidator } from "../validators/authValidator";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";

const router = express.Router();


// User signup route
router.post("/signup", validateSignup, handleValidationErrors, signup);

// User login route

/**
 * Route for user signup.
 * Validates signup data before processing the request.
 */
router.post("/signup", validateSignup, handleValidationErrors, signup);

/**
 * Route for user login.
 * Validates login credentials before processing the request.
 */

router.post("/login", loginValidator, handleValidationErrors, login);

export default router;
