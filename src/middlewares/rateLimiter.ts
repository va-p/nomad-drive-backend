import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Configuration
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

/**
 * Simple in-memory rate limiter middleware
 * For production, consider using Redis or a dedicated rate limiting service
 */
export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get client identifier (IP address or user ID if authenticated)
    const identifier = req.user?.userId || req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or get existing rate limit data
    if (!store[identifier] || now > store[identifier].resetTime) {
      store[identifier] = {
        count: 1,
        resetTime: now + WINDOW_MS,
      };
      next();
      return;
    }

    // Increment request count
    store[identifier].count++;

    // Check if limit exceeded
    if (store[identifier].count > MAX_REQUESTS) {
      const resetIn = Math.ceil((store[identifier].resetTime - now) / 1000);

      logger.warn(`Rate limit exceeded for ${identifier}`);

      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: resetIn,
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS - store[identifier].count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(store[identifier].resetTime).toISOString());

    next();
  } catch (error) {
    logger.error('Rate limiter error:', error);
    // Don't block request on rate limiter error
    next();
  }
};

/**
 * Clean up old entries periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const key in store) {
    if (now > store[key].resetTime) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => delete store[key]);

  if (keysToDelete.length > 0) {
    logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
  }
}, 60000); // Clean up every minute
