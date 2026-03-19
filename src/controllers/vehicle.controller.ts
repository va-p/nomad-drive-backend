import { Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";
import { prisma } from "../lib/prisma";

/**
 * Register a new vehicle
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

    const vehicleData = req.body;

    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
    });

    logger.info(
      `Vehicle registered successfully: ${vehicle.type}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.year}`,
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

    const { id, ...updateData } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
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

/**
 * Get vehicle by ID
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
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
