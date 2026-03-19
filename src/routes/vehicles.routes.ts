import { Router } from "express";

// Middlewares
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler";
import { validateBody, validateParams } from "../middlewares/validate";

// Schemas
import {
  vehicleRegistrationSchema,
  vehicleUpdateSchema,
  vehicleIdSchema,
} from "../schemas/vehicle.schema";

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
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authenticate,
  validateBody(vehicleRegistrationSchema),
  asyncHandler(register),
);

/**
 * @route   PUT /api/v1/vehicle/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  validateBody(vehicleUpdateSchema),
  asyncHandler(updateVehicle),
);

/**
 * @route   PATCH /api/v1/vehicle/:id
 * @desc    Partially update vehicle
 * @access  Private
 */
router.patch(
  "/:id",
  authenticate,
  validateBody(vehicleUpdateSchema),
  asyncHandler(updateVehicle),
);

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
router.get(
  "/:id",
  authenticate,
  validateParams(vehicleIdSchema),
  asyncHandler(getVehicleById),
);

/**
 * @route   DELETE /api/v1/vehicle/:id
 * @desc    Delete vehicle
 * @access  Private
 */
router.delete(
  "/:id",
  authenticate,
  validateParams(vehicleIdSchema),
  asyncHandler(deleteVehicle),
);

export default router;
