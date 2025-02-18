import express from "express";
import { login } from "../controllers/authController";
import { loginValidator } from "../validators/authValidator";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";

const router = express.Router();

/**
 * Route for user login.
 * Validates login credentials before processing the request.
 */

router.post("/login", loginValidator, handleValidationErrors, login);

export default router;
