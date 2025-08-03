import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import Logger from "../libs/logger";
import env from "../configs/envConfig";

/**
 * Custom error class for API errors with a specific status code.
 * It now accepts an optional 'details' argument.
 */
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details: any = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Middleware for enhanced error handling.
 * This middleware catches errors from downstream middleware and route handlers,
 * formats them, and sends a standardized JSON response.
 * It handles Zod validation errors, custom ApiErrors, and generic server errors.
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine the status code and message based on the error type.
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = null;

  // Handle Zod validation errors (e.g., from request body validation)
  if (err instanceof ZodError) {
    statusCode = 400; // Bad Request
    message = "Validation Error";
    details = err.flatten().fieldErrors;
    Logger.warn("Zod Validation Error:", details);
  } else if (err instanceof ApiError) {
    // Handle custom API errors
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    Logger.error(`ApiError (${statusCode}): ${message}`, details);
  } else {
    // Handle all other unexpected errors
    Logger.error("Unhandled Server Error:", err);
  }

  // Only send the error stack in development for debugging purposes
  const errorResponse: {
    message: string;
    details: any;
    stack?: string;
  } = {
    message,
    details,
  };

  if (env.NODE_ENV === "development" && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export { errorHandler, ApiError };
