import { z } from "zod";
import { VehicleType, TransmissionType, VehicleStatus } from "@prisma/client";

/**
 * Vehicle image schema for validating individual image data
 */
export const vehicleImageSchema = z.object({
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(/^https:\/\//, "Image URL must use HTTPS protocol"),
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .nonnegative("Display order must be non-negative")
    .optional(),
  caption: z.string().max(255, "Caption must be less than 255 characters").optional(),
});

/**
 * Schema for updating a specific vehicle image
 */
export const vehicleImageUpdateSchema = z.object({
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(/^https:\/\//, "Image URL must use HTTPS protocol")
    .optional(),
  isPrimary: z.boolean().optional(),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .nonnegative("Display order must be non-negative")
    .optional(),
  caption: z
    .string()
    .max(255, "Caption must be less than 255 characters")
    .optional()
    .nullable(),
});

/**
 * Schema for reordering images
 */
export const vehicleImageReorderSchema = z.object({
  images: z.array(
    z.object({
      id: z.string().uuid("Invalid image ID"),
      displayOrder: z
        .number()
        .int("Display order must be an integer")
        .nonnegative("Display order must be non-negative"),
    }),
  ),
});

/**
 * Vehicle registration schema
 */
export const vehicleRegistrationSchema = z.object({
  type: z.nativeEnum(VehicleType, {
    message: "Invalid vehicle type",
  }),
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(50, "Brand must be less than 50 characters"),
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Model must be less than 100 characters"),
  year: z
    .number()
    .int("Year must be an integer")
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(50, "Color must be less than 50 characters"),
  passengerCapacity: z
    .number()
    .int("Passenger capacity must be an integer")
    .min(1, "Passenger capacity must be at least 1")
    .max(10, "Passenger capacity cannot exceed 10"),
  transmission: z.nativeEnum(TransmissionType, {
    message: "Invalid transmission type",
  }),
  licensePlate: z
    .string()
    .min(1, "License plate is required")
    .max(20, "License plate must be less than 20 characters")
    .regex(
      /^[A-Z0-9-]+$/i,
      "License plate must contain only letters, numbers, and hyphens",
    ),
  dailyRate: z
    .number()
    .positive("Daily rate must be positive")
    .max(100000, "Daily rate is too high"),
  images: z
    .array(vehicleImageSchema)
    .optional()
    .refine(
      (images) => {
        if (!images || images.length === 0) return true;
        const primaryImages = images.filter((img) => img.isPrimary);
        return primaryImages.length <= 1;
      },
      {
        message: "Only one image can be marked as primary",
      },
    )
    .refine(
      (images) => {
        if (!images || images.length === 0) return true;
        const urls = images.map((img) => img.imageUrl);
        return urls.length === new Set(urls).size;
      },
      {
        message: "Duplicate image URLs are not allowed",
      },
    ),
});

/**
 * Vehicle update schema (all fields optional except id)
 */
export const vehicleUpdateSchema = z.object({
  id: z.string().uuid("Invalid vehicle ID"),
  type: z.nativeEnum(VehicleType).optional(),
  brand: z
    .string()
    .min(1, "Brand cannot be empty")
    .max(50, "Brand must be less than 50 characters")
    .optional(),
  model: z
    .string()
    .min(1, "Model cannot be empty")
    .max(100, "Model must be less than 100 characters")
    .optional(),
  year: z
    .number()
    .int("Year must be an integer")
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future")
    .optional(),
  color: z
    .string()
    .min(1, "Color cannot be empty")
    .max(50, "Color must be less than 50 characters")
    .optional(),
  passengerCapacity: z
    .number()
    .int("Passenger capacity must be an integer")
    .min(1, "Passenger capacity must be at least 1")
    .max(10, "Passenger capacity cannot exceed 10")
    .optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  licensePlate: z
    .string()
    .min(1, "License plate cannot be empty")
    .max(20, "License plate must be less than 20 characters")
    .regex(
      /^[A-Z0-9-]+$/i,
      "License plate must contain only letters, numbers, and hyphens",
    )
    .optional(),
  dailyRate: z
    .number()
    .positive("Daily rate must be positive")
    .max(100000, "Daily rate is too high")
    .optional(),
  isActive: z.boolean().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  images: z
    .array(vehicleImageSchema)
    .optional()
    .refine(
      (images) => {
        if (!images || images.length === 0) return true;
        const primaryImages = images.filter((img) => img.isPrimary);
        return primaryImages.length <= 1;
      },
      {
        message: "Only one image can be marked as primary",
      },
    )
    .refine(
      (images) => {
        if (!images || images.length === 0) return true;
        const urls = images.map((img) => img.imageUrl);
        return urls.length === new Set(urls).size;
      },
      {
        message: "Duplicate image URLs are not allowed",
      },
    ),
});

/**
 * Vehicle ID param schema
 */
export const vehicleIdSchema = z.object({
  id: z.string().uuid("Invalid vehicle ID"),
});

/**
 * Vehicle query filters schema
 */
export const vehicleQuerySchema = z.object({
  type: z.nativeEnum(VehicleType).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minPassengers: z.coerce.number().int().positive().optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

// Export types for TypeScript
export type VehicleRegistrationInput = z.infer<typeof vehicleRegistrationSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
export type VehicleIdInput = z.infer<typeof vehicleIdSchema>;
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>;
export type VehicleImageInput = z.infer<typeof vehicleImageSchema>;
export type VehicleImageUpdateInput = z.infer<typeof vehicleImageUpdateSchema>;
export type VehicleImageReorderInput = z.infer<typeof vehicleImageReorderSchema>;
