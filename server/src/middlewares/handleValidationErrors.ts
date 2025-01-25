import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => {
      const field = (error as unknown as { param: string }).param;
      const message = (error as { msg: string }).msg;
      return { field, message };
    });

    res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: formattedErrors,
    });
    return;
  }

  next();
};
