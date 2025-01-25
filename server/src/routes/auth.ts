import express, { Request, Response, NextFunction } from "express";
import { signup, login } from "../controllers/authController";
import { validateSignup } from "../middlewares/validateSignup";
import { loginValidator } from "../validators/authValidator";
import { validationResult } from "express-validator";
import { errorHandler } from "../middlewares/errorMiddleware";

const router = express.Router();

router.post("/signup", validateSignup, signup);

router.post(
  "/login",
  loginValidator,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      await login(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.use(errorHandler);

export default router;
