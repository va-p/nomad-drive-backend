import { z } from "zod";
import { RentalStatus } from "@prisma/client";

/**
 * Rental creation schema
 */
export const rentalCreationSchema = z
  .object({
    vehicleId: z.string().uuid("Invalid vehicle ID"),
    startDate: z.coerce.date({
      message: "Invalid start date",
    }),
    endDate: z.coerce.date({
      message: "Invalid end date",
    }),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return data.startDate >= now;
    },
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    },
  );

/**
 * Rental ID param schema
 */
export const rentalIdSchema = z.object({
  id: z.string().uuid("Invalid rental ID"),
});

/**
 * Rental status update schema
 */
export const rentalStatusUpdateSchema = z.object({
  id: z.string().uuid("Invalid rental ID"),
  status: z.nativeEnum(RentalStatus, {
    message: "Invalid rental status",
  }),
});

/**
 * Rental query filters schema
 */
export const rentalQuerySchema = z.object({
  status: z.nativeEnum(RentalStatus).optional(),
  vehicleId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
});

// Export types for TypeScript
export type RentalCreationInput = z.infer<typeof rentalCreationSchema>;
export type RentalIdInput = z.infer<typeof rentalIdSchema>;
export type RentalStatusUpdateInput = z.infer<typeof rentalStatusUpdateSchema>;
export type RentalQueryInput = z.infer<typeof rentalQuerySchema>;
