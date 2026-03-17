import { Router } from "express";

// Middlewares
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler";

// Controllers
import {
  register,
  updateVehicle,
  getVehicles,
  getVehicleById,
  deleteVehicle,
} from "../controllers/vehicle.controller";

const router = Router();

/**
 * @route   POST /api/v1/vehicle
 * @desc    Adds a new vehicle
 * @access  Private
 */
router.post("/", authenticate, asyncHandler(register));

/**
 * @route   PUT /api/v1/vehicle/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.put("/:id", authenticate, asyncHandler(updateVehicle));

/**
 * @route   PATCH /api/v1/vehicle/:id
 * @desc    Partially update vehicle
 * @access  Private
 */
router.patch("/:id", authenticate, asyncHandler(updateVehicle));

/**
 * @route   GET /api/v1/vehicle
 * @desc    Get all active vehicles
 * @access  Private
 */
router.get("/", getVehicles);

/**
 * @route   GET /api/v1/vehicle/:id
 * @desc    Get vehicles by ID
 * @access  Private
 */
router.get("/:id", authenticate, asyncHandler(getVehicleById));

/**
 * @route   DELETE /api/v1/vehicle/:id
 * @desc    Delete vehicle
 * @access  Private
 */
router.delete("/:id", authenticate, asyncHandler(deleteVehicle));

export default router;
