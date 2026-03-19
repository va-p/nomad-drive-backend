import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";
import { AppError } from "./errorHandler";
import logger from "../utils/logger";

/**
 * Validation targets
 */
type ValidationTarget = "body" | "params" | "query";

/**
 * Middleware factory to validate request data against Zod schemas
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = "body") => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Select the target data to validate
      const dataToValidate = req[target];

      // Validate the data against the schema
      const validatedData = await schema.parseAsync(dataToValidate);

      // Replace the request data with validated data
      req[target] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a readable format
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation error:", { errors, target });

        res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
        return;
      }

      // Handle unexpected errors
      logger.error("Unexpected validation error:", error);
      next(new AppError("Validation failed", 400));
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, "body");

/**
 * Validate request params
 */
export const validateParams = (schema: ZodSchema) => validate(schema, "params");

/**
 * Validate request query
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, "query");

/**
 * Validate multiple targets at once
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Array<{ field: string; message: string }> = [];

      // Validate body if schema provided
      if (schemas.body) {
        try {
          req.body = await schemas.body.parseAsync(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.issues.map((err: ZodIssue) => ({
                field: `body.${err.path.join(".")}`,
                message: err.message,
              })),
            );
          }
        }
      }

      // Validate params if schema provided
      if (schemas.params) {
        try {
          req.params = (await schemas.params.parseAsync(req.params)) as any;
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.issues.map((err: ZodIssue) => ({
                field: `params.${err.path.join(".")}`,
                message: err.message,
              })),
            );
          }
        }
      }

      // Validate query if schema provided
      if (schemas.query) {
        try {
          req.query = (await schemas.query.parseAsync(req.query)) as any;
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.issues.map((err: ZodIssue) => ({
                field: `query.${err.path.join(".")}`,
                message: err.message,
              })),
            );
          }
        }
      }

      // If there are any errors, return them
      if (errors.length > 0) {
        logger.warn("Multiple validation errors:", { errors });

        res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error("Unexpected validation error:", error);
      next(new AppError("Validation failed", 400));
    }
  };
};
