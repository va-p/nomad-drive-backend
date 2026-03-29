import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "[FATAL] JWT_SECRET environment variable is not set. " +
      "Set it in your .env file before starting the server.",
  );
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token for user
 */
export const generateToken = (user: Partial<User>): string => {
  const payload: JWTPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string | number,
    issuer: "nomaddrive",
    audience: "nomaddrive-app",
  } as jwt.SignOptions);
};

/**
 * Verify JWT token and return payload
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "nomaddrive",
      audience: "nomaddrive-app",
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Generate refresh token (longer expiration)
 */
export const generateRefreshToken = (user: Partial<User>): string => {
  const payload: JWTPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
    issuer: "nomaddrive",
    audience: "nomaddrive-app-refresh",
  } as jwt.SignOptions);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "smartfinances",
      audience: "smartfinances-app-refresh",
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    } else {
      throw new Error("Refresh token verification failed");
    }
  }
};
