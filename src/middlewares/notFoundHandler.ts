import { Request, Response } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: 'Resource not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};
