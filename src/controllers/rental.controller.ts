import { Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";
import { prisma } from "../lib/prisma";

/**
 * Create a new vehicle rental (Booking)
 */
export const createRental = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { vehicleId, startDate, endDate } = req.body;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!vehicleId || !startDate || !endDate) {
      throw new AppError("Vehicle ID, start date, and end date are required", 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new AppError("End date must be after start date", 400);
    }

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
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlappingRental) {
      throw new AppError("Vehicle is already booked for these dates", 409); // Conflict
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dailyRate = Number(vehicle.dailyRate);
    const totalPrice = diffDays * dailyRate;

    const rental = await prisma.rental.create({
      data: {
        userId,
        vehicleId,
        startDate: start,
        endDate: end,
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
        // vehicle: {
        //   select: {
        //     brand: true,
        //     model: true,
        //     year: true,
        //     color: true,
        //     licensePlate: true,
        //   },
        // },
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
    const { id } = req.params;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    if (!id || id !== typeof String) {
      throw new AppError("Rental ID is required", 400);
    }

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
