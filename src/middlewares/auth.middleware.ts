import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { verifyToken, JWTPayload } from "../utils/jwt";
import logger from "../utils/logger";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate user via Clerk or JWT token
 * Supports both Clerk authentication and traditional JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Try Clerk authentication first
    const auth = getAuth(req);

    if (auth.userId) {
      // User is authenticated via Clerk
      logger.debug(`User authenticated via Clerk: ${auth.userId}`);

      // Set user data in request for backward compatibility
      req.user = {
        userId: auth.userId,
        email: (auth.sessionClaims?.email as string) || "",
        role: (auth.sessionClaims?.role as string) || "USER",
      };

      next();
      return;
    }

    // Fallback to JWT authentication
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
      return;
    }

    // Check if token format is correct (Bearer <token>)
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        message: "Invalid token format. Use: Bearer <token>",
      });
      return;
    }

    const token = parts[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
      return;
    }

    // Verify JWT token
    try {
      const decoded = verifyToken(token);

      // Attach user info to request
      req.user = decoded;

      logger.debug(`User authenticated via JWT: ${decoded.userId}`);
      next();
    } catch (error) {
      logger.error("Token verification failed:", error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "Invalid or expired token",
      });
      return;
    }
  } catch (error) {
    logger.error("Authentication middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Middleware to require Clerk authentication specifically
 * Use this for endpoints that should only work with Clerk
 */
export const requireClerkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      res.status(401).json({
        success: false,
        message: "Clerk authentication required",
      });
      return;
    }

    // Set user data for backward compatibility
    req.user = {
      userId: auth.userId,
      email: (auth.sessionClaims?.email as string) || "",
      role: (auth.sessionClaims?.role as string) || "USER",
    };

    logger.debug(`Clerk user authenticated: ${auth.userId}`);
    next();
  } catch (error) {
    logger.error("Clerk auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (req.user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin privileges required",
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Admin check middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Helper function to get user ID from either Clerk or JWT
 */
export const getUserId = (req: Request): string | null => {
  // Try Clerk first
  const auth = getAuth(req);
  if (auth.userId) {
    return auth.userId;
  }

  // Fallback to JWT
  return req.user?.userId || null;
};

/**
 * Middleware for optional authentication
 * Allows both authenticated and unauthenticated requests
 * If authenticated, attaches user info to request
 */
export const optionalAuth = async (req: Request, next: NextFunction): Promise<void> => {
  try {
    // Try Clerk authentication first
    const auth = getAuth(req);

    if (auth.userId) {
      // User is authenticated via Clerk
      req.user = {
        userId: auth.userId,
        email: (auth.sessionClaims?.email as string) || "",
        role: (auth.sessionClaims?.role as string) || "USER",
      };
      next();
      return;
    }

    // Try JWT authentication
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(" ");

      if (parts.length === 2 && parts[0] === "Bearer") {
        const token = parts[1];

        if (token) {
          try {
            const decoded = verifyToken(token);
            req.user = decoded;
          } catch (error) {
            // Invalid token, but since this is optional auth, continue without user
            logger.debug(
              "Optional auth: Invalid token, continuing without authentication",
            );
          }
        }
      }
    }

    // Continue whether authenticated or not
    next();
  } catch (error) {
    logger.error("Optional auth middleware error:", error);
    // Don't fail the request, just continue without authentication
    next();
  }
};

/**
 * Helper function to check if request is authenticated via Clerk
 */
export const isClerkAuth = (req: Request): boolean => {
  const auth = getAuth(req);
  return !!auth.userId;
};
