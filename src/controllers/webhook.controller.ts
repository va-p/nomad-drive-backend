import { Request, Response } from "express";
import logger from "../utils/logger";
import { webhookService } from "../services/webhook.service";

/**
 * Health check endpoint for webhook
 */
export const webhookHealthCheck = async (res: Response): Promise<void> => {
  res.status(200).json({
    status: "healthy",
    service: "webhook",
    timestamp: new Date().toISOString(),
  });
};
