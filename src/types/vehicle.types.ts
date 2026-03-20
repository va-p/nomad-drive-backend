/**
 * Vehicle Image Types
 * TypeScript type definitions for vehicle image gallery feature
 */

import { VehicleImage, Vehicle } from "@prisma/client";

/**
 * Vehicle image data for creation
 */
export interface VehicleImageCreateInput {
  imageUrl: string;
  isPrimary?: boolean;
  displayOrder?: number;
  caption?: string;
}

/**
 * Vehicle image data for updates
 */
export interface VehicleImageUpdateInput {
  imageUrl?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  caption?: string | null;
}

/**
 * Image reorder item
 */
export interface ImageReorderItem {
  id: string;
  displayOrder: number;
}

/**
 * Vehicle with images relation
 */
export interface VehicleWithImages extends Vehicle {
  images: VehicleImage[];
}

/**
 * API Response for vehicle with images
 */
export interface VehicleResponse {
  success: boolean;
  message: string;
  vehicle: VehicleWithImages;
}

/**
 * API Response for image operations
 */
export interface VehicleImageResponse {
  success: boolean;
  message: string;
  image: VehicleImage;
}

/**
 * API Response for multiple vehicles
 */
export interface VehiclesListResponse {
  success?: boolean;
  vehicles?: VehicleWithImages[];
}

/**
 * Request body for adding images to vehicle
 */
export interface AddVehicleImagesRequest {
  images: VehicleImageCreateInput[];
}

/**
 * Request body for reordering images
 */
export interface ReorderVehicleImagesRequest {
  images: ImageReorderItem[];
}

/**
 * Vehicle registration with optional images
 */
export interface VehicleRegistrationWithImages {
  type: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  passengerCapacity: number;
  transmission: string;
  licensePlate: string;
  dailyRate: number;
  images?: VehicleImageCreateInput[];
}

/**
 * Vehicle update with optional images
 */
export interface VehicleUpdateWithImages {
  id: string;
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  passengerCapacity?: number;
  transmission?: string;
  licensePlate?: string;
  dailyRate?: number;
  status?: string;
  isActive?: boolean;
  images?: VehicleImageCreateInput[];
}
