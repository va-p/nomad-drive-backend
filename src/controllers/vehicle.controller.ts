import { Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";
import { prisma } from "../lib/prisma";

/**
 * Register a new vehicle
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, brand, model, year, color, transmission, licensePlate, dailyRate } =
      req.body;

    // Validate required fields
    if (
      !type ||
      !brand ||
      !model ||
      !year ||
      !color ||
      !transmission ||
      !licensePlate ||
      !dailyRate
    ) {
      throw new AppError(
        "Type, brand, model, year, color, transmission, licensePlate and dailyRate are required",
        400,
      );
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        brand,
        model,
        year,
        color,
        transmission,
        licensePlate,
        dailyRate,
      },
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
    res.status(400).json({ error: "Register error" });
  }
};

/**
 * Update vehicle
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      id,
      type,
      brand,
      model,
      year,
      color,
      transmission,
      licensePlate,
      dailyRate,
      isActive,
    } = req.body;

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

    // Validate required fields
    if (
      !id ||
      !type ||
      !brand ||
      !model ||
      !year ||
      !color ||
      !transmission ||
      !licensePlate ||
      !dailyRate ||
      !isActive
    ) {
      throw new AppError(
        "ID, type, brand, model, year, color, transmission, licensePlate, dailyRate and isActive are required",
        400,
      );
    }

    // Find vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    // Update vehicle
    await prisma.vehicle.update({
      where: { id },
      data: {
        type,
        brand,
        model,
        year,
        color,
        transmission,
        licensePlate,
        dailyRate,
        isActive,
      },
    });

    logger.info(
      `Vehicle updated successfully: ${vehicle.type}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.year}`,
    );

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
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

    // Fetch vehicles
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
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      throw new AppError("ID is required", 400);
    }

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
    const { id } = req.params;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!id || typeof id !== "string") {
      throw new AppError("ID is required", 400);
    }

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
