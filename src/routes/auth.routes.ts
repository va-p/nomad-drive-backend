import { Router } from "express";

// Middlewares
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler";
import { validateBody, validateQuery } from "../middlewares/validate";

// Schemas
import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  clerkSSOSchema,
} from "../schemas/auth.schema";

// Controllers
import {
  register,
  login,
  me,
  clerkSSO,
  clerkWebhook,
  updatePassword,
  forgotPassword,
} from "../controllers/auth.controller";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 */
router.post("/register", validateBody(registerSchema), asyncHandler(register));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post("/login", validateBody(loginSchema), asyncHandler(login));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", authenticate, asyncHandler(me));

/**
 * @route   GET /api/v1/auth/clerk_sso
 * @desc    Authenticate user via Clerk SSO
 * @access  Public
 */
router.get("/clerk_sso", validateQuery(clerkSSOSchema), asyncHandler(clerkSSO));

/**
 * @route   POST /api/v1/auth/clerk-webhook
 * @desc    Handle Clerk webhook events
 * @access  Public (but should be verified with webhook secret)
 */
router.post("/clerk-webhook", asyncHandler(clerkWebhook));

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Update user password
 * @access  Private
 */
router.put(
  "/password",
  authenticate,
  validateBody(updatePasswordSchema),
  asyncHandler(updatePassword),
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);

export default router;
