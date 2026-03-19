import { z } from "zod";

/**
 * User registration schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters")
    .toLowerCase(),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[\d\s()+\-]+$/, "Invalid phone number format")
    .max(20, "Phone must be less than 20 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Password update schema
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100, "New password must be less than 100 characters")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "New password must contain at least one special character"),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
});

/**
 * Clerk SSO schema
 */
export const clerkSSOSchema = z.object({
  clerk_user_id: z.string().min(1, "Clerk user ID is required"),
});

/**
 * User profile update schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name cannot be empty")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .optional(),
  phone: z
    .string()
    .min(1, "Phone cannot be empty")
    .regex(/^[\d\s()+\-]+$/, "Invalid phone number format")
    .max(20, "Phone must be less than 20 characters")
    .optional(),
  profileImage: z.string().url("Invalid profile image URL").optional(),
  useLocalAuthentication: z.boolean().optional(),
  skipWelcomeScreen: z.boolean().optional(),
});

// Export types for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ClerkSSOInput = z.infer<typeof clerkSSOSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
