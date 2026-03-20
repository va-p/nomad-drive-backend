import { Router } from "express";
import { z } from "zod";

// Middlewares
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/errorHandler";
import { validateBody, validateParams } from "../middlewares/validate";

// Schemas
import {
  vehicleRegistrationSchema,
  vehicleUpdateSchema,
  vehicleIdSchema,
  vehicleImageSchema,
  vehicleImageUpdateSchema,
  vehicleImageReorderSchema,
} from "../schemas/vehicle.schema";

// Controllers
import {
  register,
  updateVehicle,
  getVehicles,
  getVehicleById,
  deleteVehicle,
  addVehicleImages,
  updateVehicleImage,
  deleteVehicleImage,
  reorderVehicleImages,
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
router.get("/", authenticate, asyncHandler(getVehicles));

// ==================== IMAGE MANAGEMENT ROUTES ====================
// NOTE: These routes must be defined BEFORE the generic /:id routes
// to avoid path matching conflicts

/**
 * @route   POST /api/v1/vehicle/:id/images
 * @desc    Add images to an existing vehicle
 * @access  Private (Admin only)
 */
router.post(
  "/:id/images",
  authenticate,
  validateParams(vehicleIdSchema),
  validateBody(z.object({ images: z.array(vehicleImageSchema) })),
  asyncHandler(addVehicleImages),
);

/**
 * @route   PATCH /api/v1/vehicle/:id/images/reorder
 * @desc    Reorder vehicle images
 * @access  Private (Admin only)
 */
router.patch(
  "/:id/images/reorder",
  authenticate,
  validateParams(vehicleIdSchema),
  validateBody(vehicleImageReorderSchema),
  asyncHandler(reorderVehicleImages),
);

/**
 * @route   PUT /api/v1/vehicle/:id/images/:imageId
 * @desc    Update a specific vehicle image
 * @access  Private (Admin only)
 */
router.put(
  "/:id/images/:imageId",
  authenticate,
  validateBody(vehicleImageUpdateSchema),
  asyncHandler(updateVehicleImage),
);

/**
 * @route   DELETE /api/v1/vehicle/:id/images/:imageId
 * @desc    Delete a specific vehicle image
 * @access  Private (Admin only)
 */
router.delete("/:id/images/:imageId", authenticate, asyncHandler(deleteVehicleImage));

// ==================== END IMAGE ROUTES ====================

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
