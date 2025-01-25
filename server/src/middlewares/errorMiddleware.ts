import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${status} - ${message} - ${req.method} - ${req.url}`);

  res.status(status).json({
    success: false,
    error: message,
  });
};
