import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import logger from "../utils/logger";

import { AppError } from "../middlewares/errorHandler";

/**
 * Create a new vehicle rental (Booking)
 */
export const createRental = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const { vehicleId, startDate, endDate } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle || !vehicle.isActive) {
      throw new AppError("Vehicle is not available for rent", 404);
    }

    const overlappingRental = await prisma.rental.findFirst({
      where: {
        vehicleId,
        status: { in: ["PENDING", "ACTIVE"] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlappingRental) {
      throw new AppError("Vehicle is already booked for these dates", 409); // Conflict
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dailyRate = Number(vehicle.dailyRate);
    const totalPrice = diffDays * dailyRate;

    const rental = await prisma.rental.create({
      data: {
        userId,
        vehicleId,
        startDate,
        endDate,
        totalPrice,
        status: "PENDING", // default status
      },
    });

    res.status(201).json({
      success: true,
      message: "Rental booked successfully",
      rental,
    });
  } catch (error) {
    logger.error("Create rental error:", error);
    throw error;
  }
};

/**
 * Get all rentals for the authenticated user (For the "Trips" tab)
 */
export const getUserRentals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const rentals = await prisma.rental.findMany({
      where: { userId },
      include: {
        vehicle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, rentals });
  } catch (error) {
    logger.error("Get user rentals error:", error);
    throw error;
  }
};

/**
 * Cancel a rental
 */
export const cancelRental = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const { id } = req.params as { id: string };

    const rental = await prisma.rental.findUnique({
      where: { id },
    });

    if (!rental) {
      throw new AppError("Rental not found", 404);
    }

    if (rental.userId !== userId) {
      throw new AppError("You do not have permission to cancel this rental", 403);
    }

    const updatedRental = await prisma.rental.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    logger.info(`Rental ${id} cancelled by user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Rental cancelled successfully",
      rental: updatedRental,
    });
  } catch (error) {
    logger.error("Cancel rental error:", error);
    throw error;
  }
};
