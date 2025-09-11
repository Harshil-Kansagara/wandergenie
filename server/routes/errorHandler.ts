import { Request, Response, NextFunction } from "express";

/**
 * A custom error class that includes a status code.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Ensures the correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  console.error("💥 An error occurred:", err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "An unexpected error occurred.";

  res.status(statusCode).json({
    success: false,
    error: message,
    // Optionally include stack in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
