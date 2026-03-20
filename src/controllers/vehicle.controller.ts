import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import logger from "../utils/logger";

import { AppError } from "../middlewares/errorHandler";
import { VehicleImageInput } from "../schemas/vehicle.schema";

/**
 * Register a new vehicle
 * Supports optional image gallery with automatic primary assignment
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "ADMIN") {
      throw new AppError("Only admin users can register vehicles", 403);
    }

    const { images, ...vehicleData } = req.body;

    // Prepare image data if provided
    let imageData: VehicleImageInput[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      // Check if any image is marked as primary
      const hasPrimary = images.some((img: VehicleImageInput) => img.isPrimary);

      // Process images: set first as primary if none specified, auto-increment displayOrder
      imageData = images.map((img: VehicleImageInput, index: number) => ({
        imageUrl: img.imageUrl,
        isPrimary: hasPrimary ? img.isPrimary || false : index === 0,
        displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
        caption: img.caption,
      }));
    }

    // Create vehicle with images in a transaction
    const vehicle = await prisma.vehicle.create({
      data: {
        ...vehicleData,
        images: {
          create: imageData,
        },
      },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    logger.info(
      `Vehicle registered successfully: ${vehicle.type}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.year} with ${vehicle.images.length} images`,
    );

    res.status(201).json({
      success: true,
      message: "Vehicle registered successfully",
      vehicle,
    });
  } catch (error) {
    logger.error("Register error:", error);
    throw error;
  }
};

/**
 * Update vehicle
 * Supports updating vehicle data and replacing images
 * If images array is provided, it replaces ALL existing images
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "ADMIN") {
      throw new AppError("Only admin users can edit vehicles", 403);
    }

    const { id, images, ...updateData } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    let imageData: VehicleImageInput[] | undefined;
    if (images !== undefined) {
      if (Array.isArray(images) && images.length > 0) {
        const hasPrimary = images.some((img: VehicleImageInput) => img.isPrimary);

        imageData = images.map((img: VehicleImageInput, index: number) => ({
          imageUrl: img.imageUrl,
          isPrimary: hasPrimary ? img.isPrimary || false : index === 0,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
          caption: img.caption,
        }));
      } else {
        imageData = [];
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...updateData,
        ...(imageData !== undefined && {
          images: {
            deleteMany: {},
            create: imageData,
          },
        }),
      },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    logger.info(
      `Vehicle updated successfully: ${updatedVehicle.type}, ${updatedVehicle.brand}, ${updatedVehicle.model}, ${updatedVehicle.year}`,
    );

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    logger.error("Update vehicle error:", error);
    throw error;
  }
};

/**
 * Get all vehicles
 * Includes vehicle images sorted by display order
 */
export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.user?.userId;

    if (!authenticatedUserId) {
      res.status(401).json({ error: "User ID is required" });
      return;
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        isActive: true,
      },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(vehicles);
  } catch (error) {
    logger.error("Get vehicles error:", error);
    res.status(500).json({ error: "Get vehicles error" });
  }
};

// ==================== IMAGE-SPECIFIC ENDPOINTS ====================

/**
 * Add images to an existing vehicle
 * POST /api/v1/vehicle/:id/images
 */
export const addVehicleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new AppError("Only admin users can add vehicle images", 403);
    }

    const { id } = req.params as { id: string };
    const { images } = req.body;

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new AppError("Images array is required", 400);
    }

    // Check if vehicle already has a primary image
    const hasPrimaryImage = vehicle.images.some((img) => img.isPrimary);
    const newImageHasPrimary = images.some((img: VehicleImageInput) => img.isPrimary);

    // If adding a new primary image and one already exists, remove old primary
    if (newImageHasPrimary && hasPrimaryImage) {
      await prisma.vehicleImage.updateMany({
        where: {
          vehicleId: id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Get current max display order
    const maxDisplayOrder =
      vehicle.images.length > 0
        ? Math.max(...vehicle.images.map((img) => img.displayOrder))
        : -1;

    // Process images
    const imageData = images.map((img: VehicleImageInput, index: number) => ({
      vehicleId: id,
      imageUrl: img.imageUrl,
      isPrimary: newImageHasPrimary
        ? img.isPrimary || false
        : !hasPrimaryImage && index === 0,
      displayOrder:
        img.displayOrder !== undefined ? img.displayOrder : maxDisplayOrder + index + 1,
      caption: img.caption,
    }));

    // Create images
    await prisma.vehicleImage.createMany({
      data: imageData,
    });

    // Fetch updated vehicle with images
    const updatedVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    logger.info(`Added ${images.length} images to vehicle ${id}`);

    res.status(201).json({
      success: true,
      message: "Images added successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    logger.error("Add vehicle images error:", error);
    throw error;
  }
};

/**
 * Update a specific vehicle image
 * PUT /api/v1/vehicle/:id/images/:imageId
 */
export const updateVehicleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new AppError("Only admin users can update vehicle images", 403);
    }

    const { id, imageId } = req.params as { id: string; imageId: string };
    const updateData = req.body;

    // Verify image exists and belongs to the vehicle
    const image = await prisma.vehicleImage.findFirst({
      where: {
        id: imageId,
        vehicleId: id,
      },
    });

    if (!image) {
      throw new AppError("Image not found", 404);
    }

    // If setting this image as primary, unset other primary images
    if (updateData.isPrimary === true) {
      await prisma.vehicleImage.updateMany({
        where: {
          vehicleId: id,
          isPrimary: true,
          id: { not: imageId },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update the image
    const updatedImage = await prisma.vehicleImage.update({
      where: { id: imageId },
      data: updateData,
    });

    logger.info(`Updated image ${imageId} for vehicle ${id}`);

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    logger.error("Update vehicle image error:", error);
    throw error;
  }
};

/**
 * Delete a specific vehicle image
 * DELETE /api/v1/vehicle/:id/images/:imageId
 */
export const deleteVehicleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new AppError("Only admin users can delete vehicle images", 403);
    }

    const { id, imageId } = req.params as { id: string; imageId: string };

    // Verify image exists and belongs to the vehicle
    const image = await prisma.vehicleImage.findFirst({
      where: {
        id: imageId,
        vehicleId: id,
      },
    });

    if (!image) {
      throw new AppError("Image not found", 404);
    }

    const wasPrimary = image.isPrimary;

    // Delete the image
    await prisma.vehicleImage.delete({
      where: { id: imageId },
    });

    // If deleted image was primary, set the first remaining image as primary
    if (wasPrimary) {
      const remainingImages = await prisma.vehicleImage.findMany({
        where: { vehicleId: id },
        orderBy: { displayOrder: "asc" },
        take: 1,
      });

      if (remainingImages.length > 0) {
        await prisma.vehicleImage.update({
          where: { id: remainingImages[0].id },
          data: { isPrimary: true },
        });
      }
    }

    logger.info(`Deleted image ${imageId} from vehicle ${id}`);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    logger.error("Delete vehicle image error:", error);
    throw error;
  }
};

/**
 * Reorder vehicle images
 * PATCH /api/v1/vehicle/:id/images/reorder
 */
export const reorderVehicleImages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new AppError("Only admin users can reorder vehicle images", 403);
    }

    const { id } = req.params as { id: string };
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new AppError("Images array is required", 400);
    }

    // Verify all images belong to the vehicle
    const vehicleImages = await prisma.vehicleImage.findMany({
      where: {
        vehicleId: id,
      },
    });

    const vehicleImageIds = new Set(vehicleImages.map((img) => img.id));
    const allValid = images.every((img: { id: string; displayOrder: number }) =>
      vehicleImageIds.has(img.id),
    );

    if (!allValid) {
      throw new AppError("One or more images do not belong to this vehicle", 400);
    }

    // Update display orders in a transaction
    await prisma.$transaction(
      images.map((img: { id: string; displayOrder: number }) =>
        prisma.vehicleImage.update({
          where: { id: img.id },
          data: { displayOrder: img.displayOrder },
        }),
      ),
    );

    // Fetch updated vehicle with images
    const updatedVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    logger.info(`Reordered images for vehicle ${id}`);

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    logger.error("Reorder vehicle images error:", error);
    throw error;
  }
};

/**
 * Get vehicle by ID
 * Includes vehicle images sorted by display order
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    res.status(200).json(vehicle);
  } catch (error) {
    logger.error("Get vehicle by ID error:", error);
    throw error;
  }
};

/**
 * Delete vehicle (Soft Delete)
 */
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const { id } = req.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== "ADMIN") {
      throw new AppError("Only admin users can delete vehicles", 403);
    }

    const vehicleExists = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicleExists) {
      throw new AppError("Vehicle not found", 404);
    }

    await prisma.vehicle.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    logger.info(`Vehicle deleted (soft delete) successfully: ID ${id}`);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    logger.error("Delete vehicle error:", error);
    throw error;
  }
};
