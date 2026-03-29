/**
 * Rate Limiter Middleware
 */

import { Request, Response } from "express";

import logger from "../utils/logger";

import crypto from "crypto";
import { rateLimit } from "express-rate-limit";

// ─── Configuration ─────────────────────────────────────────────────────────────

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10); // 15 min
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
const STRICT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_STRICT_MAX || "30", 10);
const AUTH_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10", 10);

// ─── IP Helper ─────────────────────────────────────────────────────────────────

/**
 * Extracts the real client IP from the request.
 *
 * - Relies on `app.set("trust proxy", 1)` in server.ts (applied in T-07) so
 *   Express correctly resolves req.ip when behind cPanel's Apache/LiteSpeed proxy.
 * - Strips the IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4) so that the
 *   same physical client always produces the same key regardless of socket family.
 * - Falls back to the raw X-Forwarded-For header when req.ip is unavailable.
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];

  const raw =
    req.ip ??
    (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim()) ??
    "unknown";

  return raw.replace(/^::ffff:/, "").trim();
};

// ─── Fingerprint Helper ────────────────────────────────────────────────────────

/**
 * Returns a device fingerprint string for the incoming request.
 *
 * Priority:
 *
 *  1. `X-Device-Fingerprint` request header (explicit, client-provided).
 *     The frontend should generate this value using FingerprintJS (free tier)
 *     or a stable device identifier (e.g. Expo's SecureStore UUID on mobile)
 *     and attach it to every API request.
 *
 *  2. Server-derived pseudo-fingerprint (zero client-side requirement).
 *     SHA-256 of  User-Agent | Accept-Language | Accept-Encoding,
 *     truncated to 16 hex chars.  Not forgery-proof on its own, but it
 *     significantly raises the cost of pure IP-rotation attacks because an
 *     attacker must also spoof a consistent header profile on every request.
 */
const getFingerprint = (req: Request): string => {
  const clientFp = req.headers["x-device-fingerprint"];
  if (typeof clientFp === "string" && clientFp.length > 0) {
    return clientFp;
  }

  const components = [
    req.headers["user-agent"] ?? "",
    req.headers["accept-language"] ?? "",
    req.headers["accept-encoding"] ?? "",
  ].join("|");

  return crypto.createHash("sha256").update(components).digest("hex").slice(0, 16);
};

// ─── Composite Key ─────────────────────────────────────────────────────────────

/**
 * Builds the rate-limit bucket key as:  "<sanitized-ip>::<fingerprint>"
 *
 * Using both dimensions means an attacker must rotate their IP address AND
 * their device fingerprint simultaneously to open a fresh bucket — a much
 * higher bar than IP-only or user-ID-only strategies.
 */
const keyGenerator = (req: Request): string =>
  `${getClientIp(req)}::${getFingerprint(req)}`;

// ─── Global Limiter ────────────────────────────────────────────────────────────

/**
 * Applied to every route via `app.use(globalLimiter)` in server.ts.
 *
 * Budget:
 *   - 100 req / 15 min  when X-Device-Fingerprint is present
 *   -  30 req / 15 min  when X-Device-Fingerprint is absent (penalises
 *                        clients that have not implemented fingerprinting)
 *
 * Store: express-rate-limit's built-in MemoryStore.
 * On single-process cPanel deployments there is exactly one counter per key,
 * so MemoryStore is both correct and operationally zero-cost.
 */
export const globalLimiter = rateLimit({
  windowMs: WINDOW_MS,

  limit: (req: Request) =>
    req.headers["x-device-fingerprint"] ? MAX_REQUESTS : STRICT_MAX_REQUESTS,

  keyGenerator,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  skip: (_req: Request) => process.env.NODE_ENV === "test",

  handler: (req: Request, res: Response) => {
    logger.warn(`[RateLimiter] Global limit exceeded — key: ${keyGenerator(req)}`);
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

// ─── Auth Limiter ──────────────────────────────────────────────────────────────

/**
 * Applied directly on POST /auth/login and POST /auth/forgot-password
 * BEFORE validateBody (so the limit fires before JSON body parsing).
 *
 * Budget:
 *   - 10 req / 15 min  regardless of fingerprint availability.
 *     This budget is intentionally non-negotiable: credential endpoints
 *     are the primary target of brute-force and credential-stuffing attacks,
 *     so we do not reward fingerprint presence with a higher allowance here.
 *
 * The globalLimiter still runs first (mounted at the app level), so a
 * malicious client consumes both budgets simultaneously — reaching the
 * auth limit well before the global one.
 */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: AUTH_MAX_REQUESTS,

  keyGenerator,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  skip: (_req: Request) => process.env.NODE_ENV === "test",

  handler: (req: Request, res: Response) => {
    logger.warn(`[RateLimiter] Auth limit exceeded — key: ${keyGenerator(req)}`);
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later.",
    });
  },
});
