import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

export interface WebhookProcessResult {
  success: boolean;
  newTransactionsCount: number;
  categorizedCount: number;
  errors: string[];
}

class WebhookService {
  /**
   * Send Push Notification to User via OneSignal REST API
   */
  private async sendPushNotification(
    userId: string,
    newTransactionsCount: number,
  ): Promise<void> {
    try {
      const appId = process.env.ONESIGNAL_APP_ID;
      const apiKey = process.env.ONESIGNAL_REST_API_KEY;

      if (!appId || !apiKey) {
        logger.warn("OneSignal credentials not configured. Skipping push notification.");
        return;
      }

      // Define a mensagem
      const messageBody = "Você tem uma atualização sobre o seu pedido!";

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `key ${apiKey}`,
        },
        body: JSON.stringify({
          app_id: appId,
          // Presuming "external_id" on OneSignal is your userId on database
          include_external_user_ids: [userId],
          headings: { pt: "Nomad Drive", en: "Nomad Drive" },
          contents: { pt: messageBody, en: messageBody },
          // Optional: você pode passar dados extras que o app recebe ao ser clicado
          data: { type: "ORDER_UPDATED" },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        logger.error("Failed to send OneSignal push notification:", responseData);
      } else {
        logger.info(`Push notification sent to user ${userId} for sync completion.`);
      }
    } catch (error) {
      logger.error("Error sending push notification via OneSignal:", error);
    }
  }
}

export const webhookService = new WebhookService();
