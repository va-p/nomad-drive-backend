import { Router } from "express";

// Middlewares
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

// TODO: Import controllers when implemented
// import {
//   getUser,
//   updateUser,
//   updateUserConfigs,
//   deleteUser,
// } from '../controllers/user.controller';

/**
 * @route   GET /api/v1/user/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  "/:id",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ message: "User endpoints coming soon" });
  }),
);

/**
 * @route   PUT /api/v1/user/:id
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ message: "User endpoints coming soon" });
  }),
);

/**
 * @route   PATCH /api/v1/user/:id
 * @desc    Partially update user profile
 * @access  Private
 */
router.patch(
  "/:id",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ message: "User endpoints coming soon" });
  }),
);

/**
 * @route   PUT /api/v1/user/:id/configs
 * @desc    Update user configurations
 * @access  Private
 */
router.put(
  "/:id/configs",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ message: "User endpoints coming soon" });
  }),
);

/**
 * @route   DELETE /api/v1/user/:id
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.status(501).json({ message: "User endpoints coming soon" });
  }),
);

export default router;
