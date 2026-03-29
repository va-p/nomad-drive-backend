import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

import logger from "../utils/logger";

import { ZodError } from "zod";

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: any = undefined;

  // Log error
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    switch (err.code) {
      case "P2002":
        // Unique constraint violation
        const target = (err.meta?.target as string[]) || [];
        message = `A record with this ${target.join(", ")} already exists`;
        break;
      case "P2003":
        // Foreign key constraint violation
        message = "Related record not found";
        break;
      case "P2025":
        // Record not found
        message = "Record not found";
        statusCode = 404;
        break;
      case "P2014":
        // Required relation violation
        message = "Invalid relation in request";
        break;
      case "P2000":
        // Value too long for column
        message = "Value too long for database field";
        break;
      default:
        message = "Database operation failed";
    }
  }
  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  }
  // Handle Prisma initialization errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = "Database connection error";
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  // Handle Joi validation errors
  else if ((err as any).isJoi) {
    statusCode = 400;
    message = "Validation error";
    errors = (err as any).details?.map((detail: any) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
  }
  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }
  // Handle syntax errors (malformed JSON)
  else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON format";
  }

  // Send error response
  const response: any = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err.message,
    }),
  };

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found error creator
 */
export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, 404);
};

/**
 * Unauthorized error creator
 */
export const createUnauthorizedError = (message: string = "Unauthorized"): AppError => {
  return new AppError(message, 401);
};

/**
 * Forbidden error creator
 */
export const createForbiddenError = (message: string = "Forbidden"): AppError => {
  return new AppError(message, 403);
};

/**
 * Bad request error creator
 */
export const createBadRequestError = (message: string): AppError => {
  return new AppError(message, 400);
};

/**
 * Conflict error creator
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409);
};
