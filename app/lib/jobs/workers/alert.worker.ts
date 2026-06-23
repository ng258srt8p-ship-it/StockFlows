import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { sendLowStockEmail } from "~/lib/notifications/email";
import { sendSlackAlert } from "~/lib/notifications/slack";
import { sendStockAlertSMS } from "~/lib/notifications/sms";
import { broadcastSSE } from "~/lib/sse/manager.server";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
} as any;

interface AlertJobData {
  alertId: string;
}

export const alertWorker = new Worker(
  "alerts",
  async (job: Job<AlertJobData>) => {
    const { alertId } = job.data;
    const log = logger.child({ jobId: job.id, worker: "alerts" });

    const alert = await prisma.reorderAlert.findUnique({
      where: { id: alertId },
      include: {
        inventoryItem: true,
        location: true,
        shop: { include: { settings: true } },
      },
    });

    if (!alert) {
      log.warn({ alertId }, "Alert not found");
      return;
    }

    const settings = alert.shop.settings;
    if (!settings) {
      log.warn({ alertId }, "No shop settings found");
      return;
    }

    const productName = alert.inventoryItem.title;
    const locationName = alert.location.name;
    const stock = alert.currentStock;
    const reorderPt = alert.reorderPoint;
    const urgency = alert.urgency;

    // Email notifications
    if (settings.emailAlerts) {
      try {
        await sendLowStockEmail({
          shopDomain: alert.shop.shopifyDomain,
          productName,
          locationName,
          currentQty: stock,
          reorderPoint: reorderPt,
          urgency,
          recommendedQty: alert.recommendedQty,
        });
        log.info({ alertId, channel: "email" }, "Email alert sent");
      } catch (error) {
        log.error({ err: error, alertId }, "Failed to send email alert");
      }
    }

    // Slack notifications
    if (settings.slackWebhookUrl) {
      try {
        await sendSlackAlert(settings.slackWebhookUrl, {
          productName,
          locationName,
          currentQty: stock,
          reorderPoint: reorderPt,
          urgency: urgency as "CRITICAL" | "WARNING" | "INFO",
        });
        log.info({ alertId, channel: "slack" }, "Slack alert sent");
      } catch (error) {
        log.error({ err: error, alertId }, "Failed to send Slack alert");
      }
    }

    // SMS notifications for CRITICAL alerts
    if (settings.smsPhoneNumbers && urgency === "CRITICAL") {
      const phones = Array.isArray(settings.smsPhoneNumbers) ? settings.smsPhoneNumbers as string[] : [];
      for (const phone of phones) {
        try {
          await sendStockAlertSMS(phone, productName, stock, locationName, urgency as "CRITICAL" | "WARNING" | "INFO");
          log.info({ alertId, channel: "sms", phone }, "SMS alert sent");
        } catch (error) {
          log.error({ err: error, alertId, phone }, "Failed to send SMS alert");
        }
      }
    }

    // Broadcast SSE event so the dashboard updates in real-time
    broadcastSSE(alert.shop.shopifyDomain, "reorder-alert", {
      id: alert.id,
      productName,
      locationName,
      currentStock: stock,
      reorderPoint: reorderPt,
      urgency,
      recommendedQty: alert.recommendedQty,
    });

    log.info({ alertId, urgency, productName }, "Alert processed");
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 30, duration: 60_000 },
  }
);

alertWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Alert job failed");
});
