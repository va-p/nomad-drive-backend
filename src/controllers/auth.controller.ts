import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import logger from "../utils/logger";
import { generateToken } from "../utils/jwt";

import { AppError } from "../middlewares/errorHandler";

import bcrypt from "bcryptjs";
import { clerkClient } from "@clerk/express";

/**
 * Register a new user with email and password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastName, email, phone, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        phone: phone,
        role: "USER",
      },
    });

    const token = generateToken(user);

    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      authToken: token,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_image: user.profileImage,
        use_local_authentication: user.useLocalAuthentication,
      },
    });
  } catch (error) {
    logger.error("Register error:", error);
    throw error;
  }
};

/**
 * Login user with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password) {
      throw new AppError(
        "This account uses social login. Please sign in with your social account.",
        401,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user);

    logger.info(`User logged in successfully: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      authToken: token,
    });
  } catch (error) {
    logger.error("Login error:", error);
    throw error;
  }
};

/**
 * Get current authenticated user (me endpoint)
 */
export const me = async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({
      id: user.id,
      name: user.name,
      last_name: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile_image: user.profileImage,
      use_local_authentication: user.useLocalAuthentication,
    });
  } catch (error) {
    logger.error("Me endpoint error:", error);
    throw error;
  }
};

/**
 * Clerk SSO authentication
 * This endpoint is called after Clerk webhook creates/updates user
 */
export const clerkSSO = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerk_user_id } = req.query as { clerk_user_id: string };

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk_user_id },
    });

    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerk_user_id);

        const newUser = await prisma.user.create({
          data: {
            clerkId: clerk_user_id,
            name: clerkUser.firstName || "User",
            lastName: clerkUser.lastName || "",
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
            profileImage: clerkUser.imageUrl || null,
            role: "USER",
          },
        });

        const token = generateToken(newUser);

        logger.info(`User created from Clerk SSO: ${newUser.email}`);

        res.status(200).json([
          token,
          {
            id: newUser.id,
            name: newUser.name,
            last_name: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            profile_image: newUser.profileImage,
            use_local_authentication: newUser.useLocalAuthentication,
          },
        ]);
        return;
      } catch (clerkError) {
        logger.error("Clerk user fetch error:", clerkError);
        throw new AppError("Failed to fetch user from Clerk", 500);
      }
    }

    const token = generateToken(user);

    logger.info(`User logged in via Clerk SSO: ${user.email}`);

    res.status(200).json([
      token,
      {
        id: user.id,
        name: user.name,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_image: user.profileImage,
        use_local_authentication: user.useLocalAuthentication,
      },
    ]);
  } catch (error) {
    logger.error("Clerk SSO error:", error);
    throw error;
  }
};

/**
 * Clerk webhook handler
 * Handles user.created, user.updated, user.deleted events
 */
export const clerkWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, data } = req.body;

    logger.info(`Clerk webhook received: ${type}`);

    switch (type) {
      case "user.created":
        // Create user in database
        const clerkUser = data;
        await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            name: clerkUser.first_name || "User",
            lastName: clerkUser.last_name || "",
            email: clerkUser.email_addresses[0]?.email_address || "",
            phone: clerkUser.phone_numbers[0]?.phone_number || null,
            profileImage: clerkUser.image_url || null,
            role: "USER",
          },
        });
        logger.info(
          `User created from Clerk webhook: ${clerkUser.email_addresses[0]?.email_address}`,
        );
        break;

      case "user.updated":
        // Update user in database
        const updatedClerkUser = data;
        await prisma.user.update({
          where: { clerkId: updatedClerkUser.id },
          data: {
            name: updatedClerkUser.first_name || undefined,
            lastName: updatedClerkUser.last_name || undefined,
            email: updatedClerkUser.email_addresses[0]?.email_address || undefined,
            phone: updatedClerkUser.phone_numbers[0]?.phone_number || undefined,
            profileImage: updatedClerkUser.image_url || undefined,
          },
        });
        logger.info(`User updated from Clerk webhook: ${updatedClerkUser.id}`);
        break;

      case "user.deleted":
        // Delete user from database
        const deletedClerkUser = data;
        await prisma.user.delete({
          where: { clerkId: deletedClerkUser.id },
        });
        logger.info(`User deleted from Clerk webhook: ${deletedClerkUser.id}`);
        break;

      default:
        logger.warn(`Unhandled Clerk webhook event: ${type}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Clerk webhook error:", error);
    // Return 200 to prevent Clerk from retrying
    res.status(200).json({ success: false, error: "Webhook processing failed" });
  }
};

/**
 * Update user password
 */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.password) {
      throw new AppError(
        "This account uses social login. Password cannot be changed.",
        400,
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error("Update password error:", error);
    throw error;
  }
};

/**
 * Request password reset (send email with reset token)
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
      return;
    }

    // TODO: Implement email sending with reset token
    // For now, just log it
    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    throw error;
  }
};
