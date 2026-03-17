import { Router } from "express";

// Middlewares
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler";

// Controllers
import {
  createRental,
  getUserRentals,
  cancelRental,
} from "../controllers/rental.controller";

const router = Router();

/**
 * @route   POST /api/v1/rentals
 * @desc    Create a new vehicle rental
 * @access  Private
 */
router.post("/", authenticate, asyncHandler(createRental));

/**
 * @route   GET /api/v1/rentals/me
 * @desc    Get all rentals for the authenticated user
 * @access  Private
 */
router.get("/me", authenticate, asyncHandler(getUserRentals));

/**
 * @route   PUT /api/v1/rentals/:id/cancel
 * @desc    Cancel a specific rental
 * @access  Private
 */
router.put("/:id/cancel", authenticate, asyncHandler(cancelRental));

export default router;
